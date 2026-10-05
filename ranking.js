const GAME_API_KEY = "dev_75dd01bbcd6e4c31a0cf7576d2d8f47e";
const API_DOMAIN_URL = "https://api.lootlocker.io";
const LEADERBOARD_KEY = "top_tempo";

const tabela = document.getElementById("placar-corpo");
const botao = document.getElementById("botao-atualizar");

// Função auxiliar para definir o rótulo de desempenho com base no tempo
function obterTextoDesempenho(minutos) {
    if (minutos < 3) return "EXCELENTE";
    if (minutos < 4) return "MUITO BOM";
    return "BOM";
}

async function carregarPlacar() {

    botao.disabled = true;
    botao.textContent = "⏳ Testando...";

    tabela.innerHTML = `
        <div class="mensagem-placar">
            ⏳ Conectando ao LootLocker...
        </div>
    `;

    try {

        console.log("=================================");
        console.log("TESTE 1: LOGIN GUEST");
        console.log("=================================");

        const loginResponse = await fetch(
            `${API_DOMAIN_URL}/game/v2/session/guest`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    game_key: GAME_API_KEY,
                    game_version: "1.0.0"
                })
            }
        );

        const loginText = await loginResponse.text();

        console.log("Status:", loginResponse.status);
        console.log("Resposta:", loginText);

        if (!loginResponse.ok) {
            throw new Error(
                `LOGIN GUEST FALHOU - HTTP ${loginResponse.status} - ${loginText}`
            );
        }

        const loginData = JSON.parse(loginText);
        const token = loginData.session_token;

        if (!token) {
            throw new Error("LootLocker não enviou session_token.");
        }

        console.log("✅ LOGIN GUEST FUNCIONOU!");

        console.log("=================================");
        console.log("TESTE 2: LEADERBOARD");
        console.log("=================================");

        const leaderboardURL =
            `${API_DOMAIN_URL}/game/leaderboards/` +
            `${encodeURIComponent(LEADERBOARD_KEY)}` +
            `/list?count=10`;

        console.log("Leaderboard Key:", LEADERBOARD_KEY);
        console.log("URL:", leaderboardURL);

        const leaderboardResponse = await fetch(
            leaderboardURL,
            {
                method: "GET",
                headers: {
                    "x-session-token": token
                }
            }
        );

        const leaderboardText = await leaderboardResponse.text();

        console.log("Status:", leaderboardResponse.status);
        console.log("Resposta:", leaderboardText);

        if (!leaderboardResponse.ok) {
            throw new Error(
                `LEADERBOARD FALHOU - HTTP ${leaderboardResponse.status} - ${leaderboardText}`
            );
        }

        const leaderboardData = JSON.parse(leaderboardText);

        console.log("✅ LEADERBOARD FUNCIONOU!");
        console.log("Dados:", leaderboardData);

        if (
            !leaderboardData.items ||
            leaderboardData.items.length === 0
        ) {
            tabela.innerHTML = `
                <div class="mensagem-placar">
                    🏆 Login funcionou, mas o leaderboard está vazio.
                </div>
            `;
            return;
        }

        tabela.innerHTML = "";

        leaderboardData.items.forEach((item, index) => {

            const jogador =
                item.player?.name || "Jogador Anônimo";

            const rank =
                item.rank ?? (index + 1);

            const score =
                Number(item.score);

            // Converte o score (milissegundos) para tempo
            const minutos =
                Math.floor(score / 60000);

            const segundos =
                Math.floor((score % 60000) / 1000);

            const milissegundos =
                score % 1000;

            const tempo =
                `${String(minutos).padStart(2, "0")}:` +
                `${String(segundos).padStart(2, "0")}:` +
                `${String(milissegundos).padStart(3, "0")}`;

            // Define o desempenho
            const labelDesempenho =
                obterTextoDesempenho(minutos);

            tabela.innerHTML += `
                <div class="leaderboard-row">

                    <div class="rank-container">

                        <!-- COROA DO 1º LUGAR -->

                        <svg
                            class="crown"
                            viewBox="0 0 24 24">

                            <path d="
                                M5 16L3 5L8.5 10L12 4
                                L15.5 10L21 5L19 16H5
                                M19 19C19 19.6 18.6 20 18 20
                                H6C5.4 20 5 19.6 5 19V18H19V19Z
                            "/>

                        </svg>


                        <!-- ESTRELAS DO 2º E 3º LUGAR -->

                        <div class="stars">

                            ${rank === 2
                    ? `
                                        <span class="star">★</span>
                                        <span class="star">★</span>
                                    `
                    : rank === 3
                        ? `
                                            <span class="star">★</span>
                                        `
                        : ""
                }

                        </div>


                        <!-- ESCUDO -->

                        <div class="shield">

                            <span class="rank-number">
                                ${rank}
                            </span>

                        </div>

                    </div>


                    <!-- INFORMAÇÕES DO JOGADOR -->

                    <div class="user-info">

    <div class="username">
        ${jogador}
    </div>

</div>


                    <div class="divider"></div>


                    <!-- DESEMPENHO -->

                    <div class="performance">

                        <span class="perf-label">
                            DESEMPENHO
                        </span>

                        <span class="perf-value">
                            ${labelDesempenho}
                        </span>

                    </div>


                    <div class="divider"></div>


                    <!-- TEMPO PRINCIPAL -->

                    <div class="total-score">

                        <span class="score-number">
                            ⏱ ${tempo}
                        </span>

                        <span class="score-label">
                            TEMPO
                        </span>

                    </div>

                </div>
            `;
        });

    } catch (erro) {

        console.error("=================================");
        console.error("ERRO FINAL:", erro);
        console.error("=================================");

        tabela.innerHTML = `
            <div class="mensagem-placar erro">

                ❌ Erro ao carregar o placar.

                <br><br>

                Abra o Console do navegador
                para ver os detalhes.

            </div>
        `;

    } finally {

        botao.disabled = false;

        botao.textContent =
            "🔄 Atualizar placar";
    }
}

botao.addEventListener(
    "click",
    carregarPlacar
);

carregarPlacar();