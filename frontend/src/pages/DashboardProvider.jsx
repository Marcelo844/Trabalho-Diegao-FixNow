// frontend/src/pages/DashboardProvider.jsx
import React, { useMemo, useEffect, useState } from "react";
import "../styles/global.css";
import {
  fetchProviderDashboard,
  deleteServiceById,
  acceptJob,
  completeJob,
} from "../services/servicesApi";

function normalizeStatus(status) {
  if (!status) return "PENDING";
  if (status === "OPEN") return "PENDING";
  if (status === "ASSIGNED") return "IN_PROGRESS";
  return status;
}

function getStatusLabel(status) {
  const s = normalizeStatus(status);
  if (s === "PENDING") return "Nova solicitação";
  if (s === "IN_PROGRESS") return "Em atendimento";
  if (s === "DONE") return "Concluído";
  if (s === "CANCELLED") return "Cancelado";
  return s || "Pendente";
}

function formatPrice(priceCents) {
  if (priceCents == null) return "A combinar";
  const value = Number(priceCents) / 100;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function DashboardProvider() {
  const name = localStorage.getItem("fixnow_name") || "Prestador";

  const [services, setServices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingJobId, setAcceptingJobId] = useState(null);
  const [completingJobId, setCompletingJobId] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchProviderDashboard();
        console.log("DashboardProvider data =>", data);
        setServices(data.myServices || []);
        setJobs(data.jobs || []);
      } catch (err) {
        console.error(err);
        setError(
          "Não foi possível carregar as informações do seu painel. Tente novamente em alguns instantes."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const normalizedJobs = useMemo(
    () =>
      jobs.map((job) => ({
        ...job,
        _status: normalizeStatus(job.status),
      })),
    [jobs]
  );

  const opportunities = useMemo(
    () => normalizedJobs.filter((j) => j._status === "PENDING"),
    [normalizedJobs]
  );

  const jobsInProgress = useMemo(
    () => normalizedJobs.filter((j) => j._status === "IN_PROGRESS"),
    [normalizedJobs]
  );

  const jobsDone = useMemo(
    () => normalizedJobs.filter((j) => j._status === "DONE"),
    [normalizedJobs]
  );

  const resumo = useMemo(
    () => ({
      services: services.length,
      opportunities: opportunities.length,
      inProgress: jobsInProgress.length,
    }),
    [services, opportunities, jobsInProgress]
  );

  async function handleDeleteService(id) {
    if (!window.confirm("Tem certeza que deseja excluir este serviço?")) {
      return;
    }

    try {
      await deleteServiceById(id);

      // remove o serviço da lista
      setServices((prev) => prev.filter((s) => s.id !== id));

      // remove todos os jobs ligados a esse serviço do front
      setJobs((prev) =>
        prev.filter(
          (job) =>
            job.serviceId !== id && // se vier o campo scalar
            job.service?.id !== id // se vier como relação
        )
      );
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir serviço. Tente novamente.");
    }
  }

  async function handleAcceptJob(id) {
    try {
      setAcceptingJobId(id);
      const updatedJob = await acceptJob(id);

      setJobs((prev) =>
        prev.map((job) => (job.id === updatedJob.id ? updatedJob : job))
      );
    } catch (err) {
      console.error(err);
      alert("Erro ao aceitar atendimento. Tente novamente.");
    } finally {
      setAcceptingJobId(null);
    }
  }

  async function handleCompleteJob(id) {
    try {
      setCompletingJobId(id);
      const updatedJob = await completeJob(id);

      setJobs((prev) =>
        prev.map((job) => (job.id === updatedJob.id ? updatedJob : job))
      );
    } catch (err) {
      console.error(err);
      alert("Erro ao concluir atendimento. Tente novamente.");
    } finally {
      setCompletingJobId(null);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="container dashboard-inner">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Olá, {name} 👋</h1>
            <p className="dashboard-subtitle">
              Aqui você acompanha novas solicitações, atendimentos em andamento
              e gerencia os serviços que oferece no FixNow.
            </p>
          </div>

          <div className="dashboard-actions">
            <a href="/services/new" className="btn btn-primary">
              Cadastrar novo serviço
            </a>
            <a href="/profile" className="btn btn-outline">
              Ver meu perfil profissional
            </a>
          </div>
        </header>

        {loading && <p>Carregando dados do seu painel...</p>}
        {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

        {!loading && !error && (
          <>
            <section className="dashboard-section">
              <div className="dashboard-grid-3">
                <div className="card mini">
                  <p className="label">Serviços ativos</p>
                  <p className="number">{resumo.services}</p>
                </div>
                <div className="card mini">
                  <p className="label">Novas solicitações</p>
                  <p className="number">{resumo.opportunities}</p>
                </div>
                <div className="card mini">
                  <p className="label">Em atendimento</p>
                  <p className="number">{resumo.inProgress}</p>
                </div>
              </div>
            </section>

            <section className="dashboard-section">
              <h2 className="section-title">Solicitações de clientes</h2>
              <p className="section-subtitle">
                Acompanhe as novas solicitações, atendimentos em andamento e
                serviços já concluídos.
              </p>

              <div className="requests-columns">
                {/* Novas solicitações */}
                <div className="requests-column">
                  <h3>Novas solicitações</h3>
                  <p className="column-help">
                    Clientes que solicitaram seus serviços e aguardam retorno.
                  </p>

                  {opportunities.length === 0 && (
                    <p className="empty-text">
                      No momento não há novas solicitações disponíveis.
                    </p>
                  )}

                  {opportunities.map((job) => (
                    <article key={job.id} className="request-card">
                      <header>
                        <span className="badge badge-pending">
                          {getStatusLabel(job.status)}
                        </span>
                        <span className="request-id">JOB-{job.id}</span>
                      </header>

                      <h4>{job.service?.title || "Serviço sem título"}</h4>

                      <p className="request-desc">
                        {job.notes ||
                          job.service?.description ||
                          "Sem observações adicionais."}
                      </p>

                      <footer className="request-footer-row">
                        <div className="service-meta">
                          <span className="meta">
                            Cliente: {job.client?.name || "Não identificado"}
                          </span>
                          <span className="meta">
                            Valor aproximado:{" "}
                            {formatPrice(job.service?.priceCents)}
                          </span>
                        </div>
                        <div className="request-actions">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleAcceptJob(job.id)}
                            disabled={acceptingJobId === job.id}
                          >
                            {acceptingJobId === job.id
                              ? "Aceitando..."
                              : "Aceitar atendimento"}
                          </button>
                        </div>
                      </footer>
                    </article>
                  ))}
                </div>

                {/* Em atendimento */}
                <div className="requests-column">
                  <h3>Em atendimento</h3>
                  <p className="column-help">
                    Chamados que você já aceitou e está atendendo.
                  </p>

                  {jobsInProgress.length === 0 && (
                    <p className="empty-text">
                      Você ainda não possui atendimentos em andamento.
                    </p>
                  )}

                  {jobsInProgress.map((job) => (
                    <article key={job.id} className="request-card">
                      <header>
                        <span className="badge badge-in-progress">
                          {getStatusLabel(job.status)}
                        </span>
                        <span className="request-id">JOB-{job.id}</span>
                      </header>

                      <h4>{job.service?.title || "Serviço sem título"}</h4>

                      <p className="request-desc">
                        {job.notes || job.service?.description}
                      </p>

                      <footer className="request-footer-row">
                        <div className="service-meta">
                          <span className="meta">
                            Cliente: {job.client?.name || "Não identificado"}
                          </span>
                          <span className="meta">
                            Valor aproximado:{" "}
                            {formatPrice(job.service?.priceCents)}
                          </span>
                        </div>
                        <div className="request-actions">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleCompleteJob(job.id)}
                            disabled={completingJobId === job.id}
                          >
                            {completingJobId === job.id
                              ? "Concluindo..."
                              : "Concluir atendimento"}
                          </button>
                        </div>
                      </footer>
                    </article>
                  ))}
                </div>

                {/* Concluídos */}
                <div className="requests-column">
                  <h3>Concluídos</h3>
                  <p className="column-help">
                    Histórico dos últimos atendimentos finalizados.
                  </p>

                  {jobsDone.length === 0 && (
                    <p className="empty-text">
                      Você ainda não concluiu nenhum atendimento.
                    </p>
                  )}

                  {jobsDone.map((job) => (
                    <article key={job.id} className="request-card">
                      <header>
                        <span className="badge badge-done">
                          {getStatusLabel(job.status)}
                        </span>
                        <span className="request-id">JOB-{job.id}</span>
                      </header>

                      <h4>{job.service?.title || "Serviço sem título"}</h4>

                      <p className="request-desc">
                        {job.notes || job.service?.description}
                      </p>

                      <footer className="request-footer-row">
                        <div className="service-meta">
                          <span className="meta">
                            Cliente: {job.client?.name || "Não identificado"}
                          </span>
                          <span className="meta">
                            Valor aproximado:{" "}
                            {formatPrice(job.service?.priceCents)}
                          </span>
                        </div>
                        <div className="request-actions">
                          <button className="btn btn-outline">
                            Ver avaliação
                          </button>
                        </div>
                      </footer>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* Meus serviços */}
            <section className="dashboard-section">
              <h2 className="section-title">Meus serviços</h2>
              <p className="section-subtitle">
                Gerencie os serviços que você oferece na plataforma FixNow.
              </p>

              {services.length === 0 ? (
                <p className="empty-text">
                  Você ainda não cadastrou nenhum serviço. Clique em{" "}
                  <strong>&quot;Cadastrar novo serviço&quot;</strong> para começar.
                </p>
              ) : (
                <div className="services-list">
                  {services.map((service) => (
                    <article key={service.id} className="service-card">
                      <header>
                        <span
                          className={
                            service.available
                              ? "badge badge-success"
                              : "badge badge-muted"
                          }
                        >
                          {service.available ? "Disponível" : "Indisponível"}
                        </span>
                        <span className="request-id">
                          ID {String(service.id).padStart(3, "0")}
                        </span>
                      </header>

                      <h3>{service.title}</h3>

                      {service.description && (
                        <p className="service-desc">{service.description}</p>
                      )}

                      <footer className="request-footer-row">
                        <div className="service-meta">
                          <span className="meta">
                            Valor aproximado:{" "}
                            {formatPrice(service.priceCents)}
                          </span>
                        </div>
                        <div className="service-actions">
                          <a
                            href={`/services/${service.id}/edit`}
                            className="btn btn-outline"
                          >
                            Editar
                          </a>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            Excluir serviço
                          </button>
                        </div>
                      </footer>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}