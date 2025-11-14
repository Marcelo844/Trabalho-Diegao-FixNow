const router = require("express").Router();
const auth = require("./auth-middleware");

// -------------------------
// LISTAR SERVIÇOS PÚBLICOS
// -------------------------
router.get("/", async (req, res) => {
  const services = await req.prisma.service.findMany({
    where: { available: true },
    include: {
      provider: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ ok: true, services });
});

// -------------------------
// CRIAR SERVIÇO (PRESTADOR)
// -------------------------
router.post("/", auth(true), async (req, res) => {
  if (req.user.role !== "PROVIDER") {
    return res.status(403).json({ ok: false, error: "Apenas prestadores" });
  }

  const { title, description, priceCents } = req.body;

  if (
    !title?.trim() ||
    !description?.trim() ||
    priceCents == null ||
    isNaN(Number(priceCents))
  ) {
    return res.status(400).json({
      ok: false,
      error: "title, description e priceCents são obrigatórios",
    });
  }

  const service = await req.prisma.service.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      priceCents: Number(priceCents),
      providerId: req.user.id,
    },
  });

  res.json({ ok: true, service });
});

// ----------------------------------------------
// CRIAR SOLICITAÇÃO (JOB) PARA UM SERVIÇO - CLIENTE
// (rota usada pelo frontend: POST /services/:id/jobs)
// ----------------------------------------------
router.post("/:id/jobs", auth(true), async (req, res) => {
  try {
    if (req.user.role !== "CLIENT") {
      return res.status(403).json({ ok: false, error: "Apenas clientes" });
    }

    const serviceId = Number(req.params.id);
    const { notes } = req.body;

    const service = await req.prisma.service.findUnique({
      where: { id: serviceId },
      include: { provider: true },
    });

    if (!service || !service.available) {
      return res
        .status(404)
        .json({ ok: false, error: "Serviço indisponível" });
    }

    const job = await req.prisma.job.create({
      data: {
        notes: notes || "",
        // deixa o Prisma aplicar o DEFAULT (OPEN) do schema
        clientId: req.user.id,
        providerId: service.providerId,
        serviceId: service.id,
      },
      include: {
        service: true,
      },
    });

    res.json({ ok: true, job });
  } catch (err) {
    console.error("ERRO AO CRIAR JOB:", err);
    res.status(500).json({ ok: false, error: "Erro ao criar solicitação" });
  }
});

// -------------------------------------
// DASHBOARD DO CLIENTE – LISTA JOBS DELE
// -------------------------------------
router.get("/dashboard/client", auth(true), async (req, res) => {
  try {
    if (req.user.role !== "CLIENT") {
      return res.status(403).json({ ok: false, error: "Apenas clientes" });
    }

    const jobs = await req.prisma.job.findMany({
      where: { clientId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        service: {
          include: {
            provider: { select: { id: true, name: true } },
          },
        },
      },
    });

    res.json({ ok: true, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Erro ao carregar dashboard" });
  }
});

// ----------------------------------------
// DASHBOARD DO PRESTADOR – MEUS SERVIÇOS + JOBS
// ----------------------------------------
router.get("/dashboard/provider", auth(true), async (req, res) => {
  try {
    if (req.user.role !== "PROVIDER") {
      return res.status(403).json({ ok: false, error: "Apenas prestadores" });
    }

    const jobs = await req.prisma.job.findMany({
      where: {
        service: {
          providerId: req.user.id,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true } },
        service: true,
      },
    });

    const myServices = await req.prisma.service.findMany({
      where: { providerId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    console.log("DASHBOARD PROVIDER =>", {
      userId: req.user.id,
      jobs: jobs.length,
      myServices: myServices.length,
    });

    res.json({ ok: true, jobs, myServices });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ ok: false, error: "Erro ao carregar dashboard do prestador" });
  }
});

// ----------------------------------------
// ATUALIZAR DISPONIBILIDADE DE SERVIÇO
// ----------------------------------------
router.patch("/:id/availability", auth(true), async (req, res) => {
  if (req.user.role !== "PROVIDER") {
    return res.status(403).json({ ok: false, error: "Apenas prestadores" });
  }

  const id = Number(req.params.id);

  const service = await req.prisma.service.findFirst({
    where: { id, providerId: req.user.id },
  });

  if (!service) {
    return res
      .status(404)
      .json({ ok: false, error: "Serviço não encontrado" });
  }

  const updated = await req.prisma.service.update({
    where: { id },
    data: { available: Boolean(req.body.available) },
  });

  res.json({ ok: true, service: updated });
});

// ----------------------------------------
// DETALHE DO SERVIÇO (USADO EM /new-request)
// ----------------------------------------
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, error: "ID inválido" });
  }

  const service = await req.prisma.service.findUnique({
    where: { id },
    include: {
      provider: { select: { id: true, name: true } },
    },
  });

  if (!service || !service.available) {
    return res.status(404).json({
      ok: false,
      error: "Serviço não encontrado ou indisponível",
    });
  }

  res.json({ ok: true, service });
});

// ----------------------------------------
// EXCLUIR SERVIÇO (APAGA JOBS RELACIONADOS)
// ----------------------------------------
router.delete("/:id", auth(true), async (req, res) => {
  try {
    if (req.user.role !== "PROVIDER") {
      return res.status(403).json({ ok: false, error: "Apenas prestadores" });
    }

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, error: "ID inválido." });
    }

    const service = await req.prisma.service.findFirst({
      where: { id, providerId: req.user.id },
    });

    if (!service) {
      return res
        .status(404)
        .json({ ok: false, error: "Serviço não encontrado" });
    }

    await req.prisma.job.deleteMany({
      where: { serviceId: id },
    });

    await req.prisma.service.delete({ where: { id } });

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Erro ao excluir serviço." });
  }
});

// ----------------------------------------
// ACEITAR ATENDIMENTO (PRESTADOR ASSUME O JOB)
// ----------------------------------------
router.post("/jobs/:id/accept", auth(true), async (req, res) => {
  try {
    if (req.user.role !== "PROVIDER") {
      return res.status(403).json({
        ok: false,
        error: "Apenas prestadores podem aceitar atendimentos.",
      });
    }

    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, error: "ID inválido." });
    }

    const job = await req.prisma.job.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!job) {
      return res
        .status(404)
        .json({ ok: false, error: "Solicitação não encontrada." });
    }

    if (!job.service || job.service.providerId !== req.user.id) {
      return res.status(403).json({
        ok: false,
        error: "Você não pode aceitar uma solicitação de outro prestador.",
      });
    }

    // se não estiver OPEN, não deixa aceitar
    if (job.status && job.status !== "OPEN") {
      return res.status(400).json({
        ok: false,
        error: "Esta solicitação já foi atendida ou finalizada.",
      });
    }

    const updated = await req.prisma.job.update({
      where: { id },
      data: {
        status: "ASSIGNED",
        providerId: req.user.id,
      },
      include: {
        client: { select: { id: true, name: true } },
        service: true,
      },
    });

    return res.json({ ok: true, job: updated });
  } catch (err) {
    console.error("ERRO AO ACEITAR ATENDIMENTO:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Erro ao aceitar atendimento." });
  }
});

// ----------------------------------------
// CONCLUIR ATENDIMENTO (FINALIZAR JOB)
// versão bem simples: se existir o job, marca como DONE
// ----------------------------------------
router.post("/jobs/:id/complete", auth(true), async (req, res) => {
  try {
    if (req.user.role !== "PROVIDER") {
      return res.status(403).json({
        ok: false,
        error: "Apenas prestadores podem concluir atendimentos.",
      });
    }

    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, error: "ID inválido." });
    }

    const job = await req.prisma.job.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        service: true,
      },
    });

    if (!job) {
      return res
        .status(404)
        .json({ ok: false, error: "Solicitação não encontrada." });
    }

    // aqui não vamos bloquear por status; só evitamos reconcluir
    if (job.status === "DONE" || job.status === "CANCELLED") {
      return res.status(400).json({
        ok: false,
        error: "Este atendimento já foi finalizado.",
      });
    }

    const updated = await req.prisma.job.update({
      where: { id },
      data: { status: "DONE" },
      include: {
        client: { select: { id: true, name: true } },
        service: true,
      },
    });

    console.log("JOB CONCLUÍDO =>", {
      jobId: updated.id,
      status: updated.status,
      providerId: req.user.id,
    });

    return res.json({ ok: true, job: updated });
  } catch (err) {
    console.error("ERRO AO CONCLUIR ATENDIMENTO:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro ao concluir atendimento: " + err.message,
    });
  }
});

module.exports = router;
