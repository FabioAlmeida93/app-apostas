// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Configurações do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDN9467SDNNgmLsS-p-HaF0jNzyme9eKj4",
    authDomain: "app-apostas-72373.firebaseapp.com",
    projectId: "app-apostas-72373",
    storageBucket: "app-apostas-72373.appspot.com",
    messagingSenderId: "13035075006",
    appId: "1:13035075006:web:495552d13486b957e7b5ef"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para criar uma nova aposta
async function createBet() {
    const title = document.getElementById('bet-title').value;
    const options = document.getElementById('bet-options').value.split(',');
    const penalty = document.getElementById('bet-penalty').value;

    if (title && options.length && penalty) {
        try {
            await addDoc(collection(db, 'bets'), {
                title,
                options: options.map(option => option.trim()),
                penalty,
                votes: {}
            });
            alert('Aposta criada com sucesso!');
            // Limpar os campos de input
            document.getElementById('bet-title').value = '';
            document.getElementById('bet-options').value = '';
            document.getElementById('bet-penalty').value = '';
        } catch (error) {
            console.error("Erro ao criar a aposta: ", error);
        }
    } else {
        alert('Preencha todos os campos.');
    }
}

// Função para exibir as apostas
function displayBets() {
    const betList = document.getElementById('bet-list');
    const betsRef = collection(db, 'bets');

    onSnapshot(betsRef, (snapshot) => {
        betList.innerHTML = '<h2>Apostas Ativas</h2>';
        snapshot.forEach((docSnap) => {
            const bet = docSnap.data();
            const betDiv = document.createElement('div');
            betDiv.className = 'bet';

            const optionsHtml = bet.options.map(option => `
                <button onclick="vote('${docSnap.id}', '${option}')">${option}</button>
            `).join(' ');

            const votesHtml = Object.entries(bet.votes).map(([user, vote]) => `
                <p>${user} votou em: <strong>${vote}</strong></p>
            `).join('');

            const deleteButton = `<button onclick="deleteBet('${docSnap.id}')" style="margin-top: 10px; color: white; background-color: red;">Apagar Aposta</button>`;

            betDiv.innerHTML = `
                <h3>${bet.title}</h3>
                <p>Penalidade: ${bet.penalty}</p>
                <div>${optionsHtml}</div>
                <div>
                    <h4>Votos:</h4>
                    ${votesHtml || '<p>Nenhum voto ainda.</p>'}
                </div>
                ${deleteButton}
            `;
            betList.appendChild(betDiv);
        });
    });
}

// Função para votar em uma opção
async function vote(betId, option) {
    const user = prompt('Digite seu nome:');
    if (user) {
        const betDoc = doc(db, 'bets', betId);
        const betSnap = await betDoc.get();

        if (betSnap.exists()) {
            const betData = betSnap.data();
            betData.votes[user] = option;
            try {
                await updateDoc(betDoc, { votes: betData.votes });
                alert(`${user}, você votou em: ${option}`);
            } catch (error) {
                console.error("Erro ao registrar o voto: ", error);
            }
        } else {
            console.error("Aposta não encontrada!");
        }
    }
}

// Função para deletar uma aposta
async function deleteBet(betId) {
    const confirmation = confirm("Tem certeza que deseja apagar esta aposta?");
    if (confirmation) {
        try {
            await deleteDoc(doc(db, 'bets', betId));
            alert("Aposta apagada com sucesso!");
        } catch (error) {
            console.error("Erro ao apagar a aposta: ", error);
        }
    }
}

// Iniciar a exibição das apostas ao carregar a página
window.onload = () => {
    displayBets();
};
