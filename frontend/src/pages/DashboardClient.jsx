// frontend/src/pages/DashboardClient.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../styles/global.css";
import {
  fetchClientDashboard,
  fetchAllServices,
} from "../services/servicesApi";

function getStatusLabel(status) {
  switch (status) {
    case "PENDING":
      return "Pendente";
    case "IN_PROGRESS":
      return "Em andamento";
    case "DONE":
      return "Concluída";
    default:
      return "Pendente";
  }
}

function formatPrice(priceCents) {
  if (priceCents == null) return "A combinar";
  const value = Number(priceCents) / 100;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function DashboardClient() {
  const [dashboard, setDashboard] = useState({ jobs: [] });
  const [services, setServices] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

  const [jobsError, setJobsError] = useState("");
  const [servicesError, setServicesError] = useState("");

  const name = localStorage.getItem("fixnow_name") || "Cliente";

  useEffect(() => {
    async function load() {
      try {
        setLoadingJobs(true);
        setLoadingServices(true);
        setJobsError("");
        setServicesError("");

        // busca dashboard (jobs) e serviços em paralelo
        const [dashboardData, servicesData] = await Promise.all([
          fetchClientDashboard(),      // { ok, jobs: [...] }
          fetchAllServices(),          // [services...]
        ]);

        setDashboard({
          jobs: Array.isArray(dashboardData.jobs)
            ? dashboardData.jobs
            : [],
        });

        setServices(Array.isArray(servicesData) ? servicesData : []);
      } catch (err) {
        console.error(err);
        setJobsError("Erro ao carregar as informações do seu painel.");
        setServicesError(
          "Erro ao carregar a lista de serviços disponíveis."
        );
      } finally {
        setLoadingJobs(false);
        setLoadingServices(false);
      }
    }

    load();
  }, []);

  const grouped = useMemo(() => {
    const byStatus = {
      PENDING: [],
      IN_PROGRESS: [],
      DONE: [],
    };

    if (!dashboard.jobs || dashboard.jobs.length === 0) {
      return byStatus;
    }

    dashboard.jobs.forEach((job) => {
      const s = job.status || "PENDING";
      const key =
        s === "IN_PROGRESS" || s === "DONE" || s === "PENDING"
          ? s
          : "PENDING";

      byStatus[key].push(job);
    });

    return byStatus;
  }, [dashboard.jobs]);

  return (
    <div className="dashboard-page">
      <div className="container dashboard-inner">
        {/* Cabeçalho do dashboard */}
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Olá, {name} 👋</h1>
            <p className="dashboard-subtitle">
              Aqui você acompanha todas as solicitações feitas pelo FixNow,
              do primeiro contato até a conclusão do serviço.
            </p>
          </div>

          <div className="dashboard-actions">
            {/* leva o usuário direto para a seção de serviços disponíveis */}
            <a href="#available-services" className="btn btn-primary">
              Criar nova solicitação
            </a>
            <a href="/profile" className="btn btn-outline">
              Ver meu perfil
            </a>
          </div>
        </header>

        {/* Resumo rápido */}
        <section className="dashboard-section">
          <div className="dashboard-grid-3">
            <div className="card mini">
              <p className="label">Solicitações pendentes</p>
              <p className="number">{grouped.PENDING.length}</p>
            </div>
            <div className="card mini">
              <p className="label">Em andamento</p>
              <p className="number">{grouped.IN_PROGRESS.length}</p>
            </div>
            <div className="card mini">
              <p className="label">Concluídas</p>
              <p className="number">{grouped.DONE.length}</p>
            </div>
          </div>
        </section>

        {/* Lista de solicitações */}
        <section className="dashboard-section">
          <h2 className="section-title">Minhas solicitações</h2>
          <p className="section-subtitle">
            Acompanhe o status de cada atendimento: pendente, em andamento
            ou concluído.
          </p>

          {loadingJobs && <p>Carregando suas solicitações...</p>}
          {jobsError && <p style={{ color: "#b91c1c" }}>{jobsError}</p>}

          {!loadingJobs && !jobsError && (
            <div className="requests-columns">
              {/* Pendentes */}
              <div className="requests-column">
                <h3>Pendentes</h3>
                <p className="column-help">
                  Aguardando retorno de um prestador de serviços.
                </p>

                {grouped.PENDING.length === 0 && (
                  <p className="empty-text">
                    Você não possui solicitações pendentes no momento.
                  </p>
                )}

                {grouped.PENDING.map((job) => (
                  <article className="request-card" key={job.id}>
                    <header>
                      <span className="badge badge-pending">
                        {getStatusLabel(job.status)}
                      </span>
                      <span className="request-id">JOB-{job.id}</span>
                    </header>
                    <h4>{job.service?.title || "Serviço"}</h4>
                    <p className="request-desc">
                      {job.notes || job.service?.description}
                    </p>
                    <footer>
                      <span className="meta">
                        Prestador:{" "}
                        {job.service?.provider?.name || "Não informado"}
                      </span>
                    </footer>
                  </article>
                ))}
              </div>

              {/* Em andamento */}
              <div className="requests-column">
                <h3>Em andamento</h3>
                <p className="column-help">
                  Serviços que já foram aceitos por um prestador.
                </p>

                {grouped.IN_PROGRESS.length === 0 && (
                  <p className="empty-text">
                    Nenhum atendimento em andamento no momento.
                  </p>
                )}

                {grouped.IN_PROGRESS.map((job) => (
                  <article className="request-card" key={job.id}>
                    <header>
                      <span className="badge badge-in-progress">
                        {getStatusLabel(job.status)}
                      </span>
                      <span className="request-id">JOB-{job.id}</span>
                    </header>
                    <h4>{job.service?.title || "Serviço"}</h4>
                    <p className="request-desc">
                      {job.notes || job.service?.description}
                    </p>
                    <footer>
                      <span className="meta">
                        Prestador:{" "}
                        {job.service?.provider?.name || "Não informado"}
                      </span>
                    </footer>
                  </article>
                ))}
              </div>

              {/* Concluídas */}
              <div className="requests-column">
                <h3>Concluídas</h3>
                <p className="column-help">
                  Serviços finalizados. Em breve você poderá avaliar cada um.
                </p>

                {grouped.DONE.length === 0 && (
                  <p className="empty-text">
                    Ainda não há serviços concluídos por aqui.
                  </p>
                )}

                {grouped.DONE.map((job) => (
                  <article className="request-card" key={job.id}>
                    <header>
                      <span className="badge badge-done">
                        {getStatusLabel(job.status)}
                      </span>
                      <span className="request-id">JOB-{job.id}</span>
                    </header>
                    <h4>{job.service?.title || "Serviço"}</h4>
                    <p className="request-desc">
                      {job.notes || job.service?.description}
                    </p>
                    <footer>
                      <span className="meta">
                        Prestador:{" "}
                        {job.service?.provider?.name || "Não informado"}
                      </span>
                    </footer>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Serviços disponíveis */}
        <section
          className="dashboard-section"
          id="available-services"
        >
          <h2 className="section-title">Serviços disponíveis</h2>
          <p className="section-subtitle">
            Veja todos os serviços publicados pelos prestadores e escolha
            aquele que melhor atende à sua necessidade.
          </p>

          {loadingServices && <p>Carregando serviços disponíveis...</p>}
          {servicesError && (
            <p style={{ color: "#b91c1c" }}>{servicesError}</p>
          )}

          {!loadingServices && !servicesError && services.length === 0 && (
            <p className="empty-text">
              Ainda não há serviços disponíveis para solicitação.
            </p>
          )}

          <div className="service-list">
            {services.map((service) => (
              <article className="service-card" key={service.id}>
                <header>
                  <span className="badge badge-pending">Disponível</span>
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
                      Prestador: {service.provider?.name || "Não informado"}
                    </span>
                    <span className="meta">
                      Preço aproximado: {formatPrice(service.priceCents)}
                    </span>
                  </div>

                  <div className="service-actions">
                    <a
                      href={`/new-request?serviceId=${service.id}`}
                      className="btn btn-link"
                    >
                      Criar solicitação
                    </a>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}