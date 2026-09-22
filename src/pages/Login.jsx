import "../styles/Login.css";

export default function Login() {
  return (
    <main className="login-page">
      <section className="login-card">
        <span className="tag">Acesso interno</span>
        <h1>Entrar no painel</h1>
        <p>
          Área reservada para administração do salão e organização interna.
        </p>

        <form className="login-form">
          <label>
            Usuário
            <input type="text" placeholder="Digite seu usuário" />
          </label>

          <label>
            Senha
            <input type="password" placeholder="Digite sua senha" />
          </label>

          <button type="button">Entrar</button>
        </form>
      </section>
    </main>
  );
}
