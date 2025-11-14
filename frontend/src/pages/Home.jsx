import React from "react";
import "../styles/landing.css";

export default function Home() {
  const token = localStorage.getItem("fixnow_token");
  const role = localStorage.getItem("fixnow_role");

  const primaryCtaHref = token
    ? role === "PROVIDER"
      ? "/dashboard/provider"
      : "/dashboard/client"
    : "/register";

  const primaryCtaLabel = token
    ? role === "PROVIDER"
      ? "Ir para meu painel"
      : "Ver minhas solicitações"
    : "Criar minha conta";

  const secondaryCtaHref = token ? "/profile" : "/login";
  const secondaryCtaLabel = token ? "Meu perfil" : "Entrar";

  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="pill">Plataforma de serviços sob medida</span>
            <h1>
              Resolva qualquer problema da sua casa com o{" "}
              <span>FixNow</span>
            </h1>
            <p className="hero-sub">
              Conectamos clientes a prestadores de serviços avaliados,
              com agendamento simples, comunicação direta e mais segurança
              em cada atendimento.
            </p>

            <div className="hero-actions">
              <a href={primaryCtaHref} className="btn btn-primary">
                {primaryCtaLabel}
              </a>
              <a href={secondaryCtaHref} className="btn btn-outline">
                {secondaryCtaLabel}
              </a>
            </div>

            <div className="hero-meta">
              <span>✅ Profissionais avaliados pelos próprios clientes</span>
              <span>⏱️ Agilidade no contato e no agendamento</span>
            </div>
          </div>

          <div className="hero-art">
            <div className="hero-card">
              <p className="hero-card-title">Exemplos de serviços</p>
              <ul className="hero-list">
                <li>🔧 Manutenção elétrica e hidráulica</li>
                <li>🧹 Limpeza residencial e comercial</li>
                <li>💻 Suporte de informática</li>
                <li>🔑 Chaveiro e emergências</li>
              </ul>
              <p className="hero-card-foot">
                Tudo em um só lugar, com transparência e praticidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="section">
        <div className="container">
          <header className="section-head">
            <h2 className="section-title">Por que escolher o FixNow?</h2>
            <p className="section-subtitle">
              Uma experiência pensada tanto para quem precisa de ajuda
              quanto para quem oferece serviços.
            </p>
          </header>

          <ul className="grid cards">
            <li className="card">
              <div className="icon">🎯</div>
              <h3>Encontro certeiro</h3>
              <p>
                Centralizamos diversos tipos de serviços em um só lugar,
                facilitando para o cliente e gerando mais oportunidades
                para o prestador.
              </p>
            </li>
            <li className="card">
              <div className="icon">⏱️</div>
              <h3>Menos burocracia</h3>
              <p>
                Solicitações rápidas, comunicação direta e um fluxo simples
                do primeiro contato até a finalização do serviço.
              </p>
            </li>
            <li className="card">
              <div className="icon">⭐</div>
              <h3>Confiança construída</h3>
              <p>
                Avaliações reais ajudam clientes a escolher melhor e
                prestadores a se destacarem pelo bom trabalho.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="section light">
        <div className="container two-columns">
          <div>
            <h2 className="section-title">Como funciona para clientes?</h2>
            <ol className="steps">
              <li>
                <span>1</span> Crie sua conta gratuita.
              </li>
              <li>
                <span>2</span> Escolha o tipo de serviço que você precisa.
              </li>
              <li>
                <span>3</span> Combine diretamente com o prestador.
              </li>
              <li>
                <span>4</span> Avalie a experiência após o atendimento.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="section-title">E para prestadores?</h2>
            <ol className="steps">
              <li>
                <span>1</span> Crie seu perfil profissional.
              </li>
              <li>
                <span>2</span> Defina os serviços que você oferece.
              </li>
              <li>
                <span>3</span> Receba solicitações de novos clientes.
              </li>
              <li>
                <span>4</span> Ganhe visibilidade com boas avaliações.
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* SEGURANÇA E TRANSPARÊNCIA (VERSÃO A) */}
      <section className="section trust-new">
        <div className="container">
          <h2 className="section-title center">Segurança e transparência</h2>
          <p className="section-subtitle center">
            Uma plataforma pensada para trazer mais clareza, confiança e
            organização entre clientes e prestadores.
          </p>

          <div className="trust-grid">
            <div className="trust-card">
              <div className="trust-icon">🛡️</div>
              <h3>Perfis verificados</h3>
              <p>
                Prestadores com informações claras e atualizadas sobre
                os serviços que oferecem.
              </p>
            </div>

            <div className="trust-card">
              <div className="trust-icon">⭐</div>
              <h3>Avaliações reais</h3>
              <p>
                Clientes avaliam cada atendimento, aumentando a segurança
                na hora de escolher com quem contratar.
              </p>
            </div>

            <div className="trust-card">
              <div className="trust-icon">📄</div>
              <h3>Histórico organizado</h3>
              <p>
                Registro de todas as solicitações e atendimentos em um
                painel simples e transparente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta">
        <div className="container cta-inner">
          <h2>Pronto para testar o FixNow na prática?</h2>
          <p>
            Crie uma conta gratuita e veja como é simples conectar serviços
            e oportunidades em um único lugar.
          </p>
          <a href={primaryCtaHref} className="btn btn-primary">
            Começar agora
          </a>
        </div>
      </section>
    </div>
  );
}