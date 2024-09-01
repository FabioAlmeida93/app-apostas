// Array para armazenar as apostas
const bets = [];

// Função para salvar as apostas no localStorage
function saveBets() {
    localStorage.setItem('bets', JSON.stringify(bets));
}

// Função para carregar as apostas do localStorage
function loadBets() {
    const savedBets = localStorage.getItem('bets');
    if (savedBets) {
        // Carregar as apostas salvas no array bets
        bets.push(...JSON.parse(savedBets));
        displayBets();
    }
}

// Função para criar uma nova aposta
function createBet() {
    const title = document.getElementById('bet-title').value;
    const options = document.getElementById('bet-options').value.split(',');
    const penalty = document.getElementById('bet-penalty').value;

    if (title && options.length && penalty) {
        const bet = {
            title,
            options: options.map(option => option.trim()),
            penalty,
            votes: {}
        };
        bets.push(bet);
        saveBets();  // Salvar a nova aposta no localStorage
        displayBets();  // Atualizar a exibição das apostas
        // Limpar os campos de input
        document.getElementById('bet-title').value = '';
        document.getElementById('bet-options').value = '';
        document.getElementById('bet-penalty').value = '';
    } else {
        alert('Preencha todos os campos.');
    }
}

// Função para exibir as apostas na página
function displayBets() {
    const betList = document.getElementById('bet-list');
    betList.innerHTML = '<h2>Apostas Ativas</h2>';
    
    bets.forEach((bet, index) => {
        const betDiv = document.createElement('div');
        betDiv.className = 'bet';

        const optionsHtml = bet.options.map(option => `
            <button onclick="vote(${index}, '${option}')">${option}</button>
        `).join(' ');

        // Adicionando a lista de votantes
        const votesHtml = Object.entries(bet.votes).map(([user, vote]) => `
            <p>${user} votou em: <strong>${vote}</strong></p>
        `).join('');

        // Adicionando o botão para apagar a aposta
        const deleteButton = `<button onclick="deleteBet(${index})" style="margin-top: 10px; color: white; background-color: red;">Apagar Aposta</button>`;

        betDiv.innerHTML = `
            <h3>${bet.title}</h3>
            <p>Penalidade: ${bet.penalty}</p>
            <div>${optionsHtml}</div>
            <div>
                <h4>Votos:</h4>
                ${votesHtml}
            </div>
            ${deleteButton}  <!-- Exibe o botão de apagar -->
        `;
        betList.appendChild(betDiv);
    });
}

// Função para registrar o voto de um usuário
function vote(betIndex, option) {
    const user = prompt('Digite seu nome:');
    if (user) {
        bets[betIndex].votes[user] = option;
        saveBets();  // Salvar os votos no localStorage
        displayBets();  // Atualizar a exibição das apostas com os votos
        alert(`${user}, você votou em: ${option}`);
    }
}

// Função para apagar uma aposta
function deleteBet(index) {
    const confirmation = confirm("Tem certeza que deseja apagar esta aposta?");
    if (confirmation) {
        bets.splice(index, 1);  // Remove a aposta do array
        saveBets();  // Atualiza o localStorage
        displayBets();  // Atualiza a exibição
    }
}

// Carregar as apostas ao iniciar a aplicação
document.addEventListener('DOMContentLoaded', loadBets);
