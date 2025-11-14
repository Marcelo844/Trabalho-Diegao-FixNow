// src/pages/ServiceCreate.jsx
import React, { useState } from "react";
import api from "../services/api";
import "../styles/global.css";

export default function ServiceCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !price) {
      setError("Preencha nome, descrição e preço do serviço.");
      return;
    }

    const priceNumber = Number(String(price).replace(",", "."));

    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      setError("Informe um valor de preço válido (maior que zero).");
      return;
    }

    // backend espera priceCents (centavos)
    const priceCents = Math.round(priceNumber * 100);

    try {
      const response = await api.post("/services", {
        title,
        description,
        priceCents,
      });

      if (response.data?.ok) {
        alert("Serviço cadastrado com sucesso!");
        window.location.href = "/dashboard/provider";
      } else {
        setError(
          response.data?.error ||
            "Não foi possível cadastrar o serviço. Tente novamente."
        );
      }
    } catch (err) {
      console.error("Erro ao cadastrar serviço:", err?.response?.data || err);

      const backendMsg = err?.response?.data?.error;
      setError(
        backendMsg ||
          "Erro ao cadastrar serviço. Verifique se está logado como prestador."
      );
    }
  }

  return (
    <div className="container page">
      <h1 className="page-title">Cadastrar novo serviço</h1>
      <p className="page-subtitle">
        Preencha as informações do serviço que você deseja oferecer pelo FixNow.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        <label>
          Nome do serviço
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Troca de torneira"
            required
          />
        </label>

        <label>
          Descrição
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o que está incluído no serviço."
            rows={4}
            required
          />
        </label>

        <label>
          Preço aproximado (obrigatório)
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ex: 80"
            min="1"
            step="0.01"
            required
          />
        </label>

        <button type="submit" className="btn btn-primary">
          Salvar serviço
        </button>
      </form>
    </div>
  );
}