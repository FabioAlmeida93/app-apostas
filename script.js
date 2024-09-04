// Importar funções necessárias do Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDN9467SDNNgmLsS-p-HaF0jNzyme9eKj4",
    authDomain: "app-apostas-72373.firebaseapp.com",
    projectId: "app-apostas-72373",
    storageBucket: "app-apostas-72373.appspot.com",
    messagingSenderId: "13035075006",
    appId: "1:13035075006:web:495552d13486b957e7b5ef"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referências aos elementos do DOM
const numTeamsInput = document.getElementById('num-teams');
const confirmTeamsButton = document.getElementById('confirmTeamsButton');
const playerNameInput = document.getElementById('player-name');
const distributeButton = document.getElementById('distributeButton');
const resetButton = document.getElementById('resetButton');
const teamsList = document.getElementById('teams-list');

let numTeams; // Variável para armazenar o número de equipes confirmado
let creatorID; // ID do criador, definido quando o número de equipes é confirmado

// Função para confirmar o número de equipes
async function confirmTeams() {
    numTeams = parseInt(numTeamsInput.value);
    
    if (isNaN(numTeams) || numTeams < 2) {
        alert('Por favor, insira um número válido de equipas (mínimo 2).');
        return;
    }

    // Desabilitar o campo de número de equipes e o botão de confirmação
    numTeamsInput.disabled = true;
    confirmTeamsButton.disabled = true;

    // Habilitar o botão de distribuição de jogadores e reset
    distributeButton.disabled = false;
    resetButton.disabled = false;

    // Definir o ID do criador (poderia ser o ID do usuário autenticado, por exemplo)
    creatorID = new Date().getTime().toString(); // Gerar um ID único baseado no timestamp

    // Criar a estrutura das equipes na interface
    teamsList.innerHTML = '';
    for (let i = 1; i <= numTeams; i++) {
        const teamDiv = document.createElement('div');
        teamDiv.innerHTML = `
            <h3>Equipa ${i}</h3>
            <p>Jogadores: Nenhum jogador ainda.</p>
            <hr />
        `;
        teamsList.appendChild(teamDiv);
    }

    // Salvar o número de equipes e o ID do criador no Firestore
    await setDoc(doc(db, 'gameSettings', 'settings'), {
        numTeams: numTeams,
        creatorID: creatorID
    });

    // Carregar dados atuais
    loadGameData();
}

// Função para distribuir os jogadores entre as equipes
async function distributePlayers() {
    const playerName = playerNameInput.value.trim();

    if (!playerName) {
        alert('Por favor, escreve o teu nome.');
        return;
    }

    try {
        // Obter as configurações do jogo
        const settingsDoc = await getDoc(doc(db, 'gameSettings', 'settings'));
        const settings = settingsDoc.data();
        if (!settings || !settings.numTeams) {
            alert('Número de equipas não definido.');
            return;
        }

        // Obter a lista de jogadores e suas equipes
        const playersSnapshot = await getDocs(collection(db, 'players'));
        const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Verificar se o jogador já foi adicionado
        const existingPlayer = players.find(player => player.name === playerName);
        if (existingPlayer) {
            alert('Este jogador já foi adicionado a uma equipa.');
            return;
        }

        // Criar equipes vazias ou preencher com jogadores existentes
        let teams = Array.from({ length: settings.numTeams }, (_, i) => ({ id: i + 1, players: [] }));
        players.forEach(player => {
            if (player.teamId !== undefined) {
                teams[player.teamId - 1].players.push(player.name);
            }
        });

        // Adicionar o novo jogador à equipe com menos jogadores
        let availableTeams = teams.filter(team => team.players.length < 5);

        if (availableTeams.length === 0) {
            alert('Todas as equipas estão cheias.');
            return;
        }

        // Distribuir jogadores uniformemente
        // Calcular a quantidade média de jogadores por equipe
        const avgPlayers = Math.floor(players.length / settings.numTeams);
        // Filtrar equipes que estão abaixo da média
        availableTeams = availableTeams.filter(team => team.players.length < avgPlayers + 1);

        // Se todas as equipes estão equilibradas, apenas escolher aleatoriamente
        const selectedTeam = availableTeams.length > 0 
            ? availableTeams[Math.floor(Math.random() * availableTeams.length)]
            : teams[Math.floor(Math.random() * teams.length)];

        selectedTeam.players.push(playerName);

        // Registrar o jogador e sua equipe no Firestore
        await addDoc(collection(db, 'players'), {
            name: playerName,
            teamId: selectedTeam.id
        });

        // Exibir as equipes com os jogadores, mantendo a ordem das equipes
        teamsList.innerHTML = '';
        teams.forEach(team => {
            const teamDiv = document.createElement('div');
            teamDiv.innerHTML = `
                <h3>Equipa ${team.id}</h3>
                <p>Jogadores: ${team.players.join(', ') || 'Nenhum jogador ainda.'}</p>
                <hr />
            `;
            teamsList.appendChild(teamDiv);
        });

        // Limpar o campo de nome do jogador após a distribuição
        playerNameInput.value = '';

    } catch (error) {
        console.error("Erro ao distribuir jogadores: ", error);
    }
}

// Função para resetar os campos e limpar as equipes
async function resetTeams() {
    try {
        // Obter as configurações do jogo
        const settingsDoc = await getDoc(doc(db, 'gameSettings', 'settings'));
        const settings = settingsDoc.data();

        // Verificar se o usuário atual é o criador
        if (settings && settings.creatorID !== creatorID) {
            alert('Apenas o criador pode fazer o reset.');
            return;
        }

        // Deletar todos os jogadores registrados no Firestore
        const playersSnapshot = await getDocs(collection(db, 'players'));
        playersSnapshot.forEach(async (docSnap) => {
            await deleteDoc(doc(db, 'players', docSnap.id));
        });

        // Limpar campos de input e reabilitar o botão de confirmação
        numTeamsInput.value = '';
        playerNameInput.value = '';
        teamsList.innerHTML = '';

        numTeamsInput.disabled = false;
        confirmTeamsButton.disabled = false;
        distributeButton.disabled = true;
        resetButton.disabled = true;

        // Limpar as configurações do jogo
        await deleteDoc(doc(db, 'gameSettings', 'settings'));

    } catch (error) {
        console.error("Erro ao resetar as equipas: ", error);
    }
}

// Função para carregar dados do jogo e atualizar a interface
async function loadGameData() {
    try {
        // Obter as configurações do jogo
        const settingsDoc = await getDoc(doc(db, 'gameSettings', 'settings'));
        const settings = settingsDoc.data();
        if (!settings || !settings.numTeams) {
            // Nenhum jogo configurado
            return;
        }

        numTeams = settings.numTeams;
        creatorID = settings.creatorID;

        // Criar a estrutura das equipes na interface
        teamsList.innerHTML = '';
        for (let i = 1; i <= numTeams; i++) {
            const teamDiv = document.createElement('div');
            teamDiv.innerHTML = `
                <h3>Equipa ${i}</h3>
                <p>Jogadores: Nenhum jogador ainda.</p>
                <hr />
            `;
            teamsList.appendChild(teamDiv);
        }

        // Carregar a lista de jogadores
        const playersSnapshot = await getDocs(collection(db, 'players'));
        const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Preencher as equipes com jogadores existentes
        let teams = Array.from({ length: numTeams }, (_, i) => ({ id: i + 1, players: [] }));
        players.forEach(player => {
            if (player.teamId !== undefined) {
                teams[player.teamId - 1].players.push(player.name);
            }
        });

        // Exibir as equipes com os jogadores, mantendo a ordem das equipes
        teamsList.innerHTML = '';
        teams.forEach(team => {
            const teamDiv = document.createElement('div');
            teamDiv.innerHTML = `
                <h3>Equipa ${team.id}</h3>
                <p>Jogadores: ${team.players.join(', ') || 'Nenhum jogador ainda.'}</p>
                <hr />
            `;
            teamsList.appendChild(teamDiv);
        });

        // Atualizar o estado dos botões
        const isCreator = settings.creatorID === creatorID;
        numTeamsInput.disabled = isCreator ? true : false;
        confirmTeamsButton.disabled = isCreator ? true : false;
        distributeButton.disabled = !settings.numTeams || !isCreator;
        resetButton.disabled = !isCreator;

    } catch (error) {
        console.error("Erro ao carregar dados do jogo: ", error);
    }
}

// Adicionar os event listeners aos botões
confirmTeamsButton.addEventListener('click', confirmTeams);
distributeButton.addEventListener('click', distributePlayers);
resetButton.addEventListener('click', resetTeams);

// Carregar dados ao iniciar a aplicação
window.addEventListener('load', loadGameData);
