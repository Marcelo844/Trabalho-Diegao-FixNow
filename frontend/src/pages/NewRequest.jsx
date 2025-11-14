// frontend/src/pages/NewRequest.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/global.css";
import {
  fetchServiceById,
  createJobForService,
} from "../services/servicesApi";

function formatPrice(priceCents) {
  if (priceCents == null) return "A combinar";
  const value = Number(priceCents) / 100;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export default function NewRequest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("serviceId");

  const [service, setService] = useState(null);
  const [notes, setNotes] = useState("");
  const [loadingService, setLoadingService] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!serviceId) {
      setError("Serviço não informado.");
      setLoadingService(false);
      return;
    }

    async function loadService() {
      try {
        setLoadingService(true);
        setError("");
        const data = await fetchServiceById(serviceId);
        setService(data);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os dados do serviço.");
      } finally {
        setLoadingService(false);
      }
    }

    loadService();
  }, [serviceId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!serviceId) return;

    try {
      setSaving(true);
      setError("");
      setSuccessMsg("");

      await createJobForService(serviceId, notes);

      setSuccessMsg("Solicitação criada com sucesso!");
      // pequeno delay só para o usuário ver a mensagem, se quiser
      setTimeout(() => {
        navigate("/dashboard/client");
      }, 800);
    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data?.error ||
        "Não foi possível criar a solicitação. Verifique se você está logado como cliente.";

      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="container dashboard-inner">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Nova solicitação</h1>
            <p className="dashboard-subtitle">
              Revise os detalhes do serviço e descreva o que você precisa.
            </p>
          </div>
        </header>

        {loadingService && <p>Carregando informações do serviço...</p>}

        {!loadingService && error && (
          <div className="alert alert-danger" style={{ marginTop: "1rem" }}>
            {error}
          </div>
        )}

        {!loadingService && !error && service && (
          <>
            {/* Resumo do serviço */}
            <section className="dashboard-section">
              <div className="card">
                <h2>{service.title}</h2>
                <p className="request-desc">{service.description}</p>

                <div className="meta" style={{ marginTop: "0.75rem" }}>
                  <span>
                    Prestador:{" "}
                    {service.provider?.name || "Prestador não informado"}
                  </span>
                  <span>
                    Preço aproximado: {formatPrice(service.priceCents)}
                  </span>
                </div>
              </div>
            </section>

            {/* Formulário de criação de job */}
            <section className="dashboard-section">
              {successMsg && (
                <div className="alert alert-success">{successMsg}</div>
              )}

              <form className="card" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="notes">
                    Descreva o que você precisa (opcional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={5}
                    placeholder="Ex.: Preciso que venha no sábado de manhã, verifique também a fiação do quadro..."
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => navigate("/dashboard/client")}
                    disabled={saving}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Enviando..." : "Confirmar solicitação"}
                  </button>
                </div>
              </form>
            </section>
          </>
        )}
      </div>
    </div>
  );
}