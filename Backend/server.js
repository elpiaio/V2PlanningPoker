const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server\n');
});

const wss = new WebSocket.Server({ server });

const connectedUsers = new Map();

var exibirVotos = false;
var refreshUsers = false;

wss.on('connection', (ws) => {
  // Evento para lidar com mensagens recebidas
  ws.on('message', (message) => {
    try {
      const userObject = JSON.parse(message);
      refreshUsers = false;

      // Adiciona o usuário à lista de usuários conectados
      if (userObject.idxuser != null) { //valida se votou ou não
        connectedUsers.set(ws, {
          sectionName: userObject.sectionName,
          sectionId: userObject.sectionId,
          name: userObject.name,
          id: userObject.id,
          votou: true,
          idxuser: userObject.idxuser,
          isAdmin: userObject.isAdmin,
          refreshAdm: userObject.refreshAdm,
          exibir: userObject.exibir,
        });
      } else {
        connectedUsers.set(ws, {
          sectionName: userObject.sectionName,
          sectionId: userObject.sectionId,
          name: userObject.name,
          id: userObject.id,
          votou: userObject.votou,
          idxuser: userObject.idxuser,
          isAdmin: userObject.isAdmin,
          refreshAdm: userObject.refreshAdm,
          exibir: userObject.exibir,
        });
      }

      ////////
      refreshVotation() //zera votação
      /////////
      exibindoVotos() //exibe os votos

      //montando o arquivo JSON
      //montandoRoom()

      // Notifica todos os usuários sobre o novo usuário
      broadcastUserList();
    } catch (error) {
      console.error('Erro ao processar a mensagem JSON:', error);
    }
  });

  // Evento para lidar com a desconexão do cliente
  ws.on('close', () => {
    // Remove o usuário da lista de usuários conectados
    connectedUsers.delete(ws);

    // Notifica todos os usuários sobre a saída do usuário
    broadcastUserList();
  });
});

function broadcastUserList() {
  //Converte a lista de usuários para um array de objetos
  userList = {}
  userList = Array.from(connectedUsers.values()).map((user) => {
    return user;
  });


  // Converte o array de objetos para uma string JSON
  const userListJson = JSON.stringify(userList);

  // Envia a lista de usuários conectados para todos os clientes
  connectedUsers.forEach((user, userSocket) => {
    userSocket.send(userListJson);
  });
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});





////////////// VALIDAÇÕES
function refreshVotation(){
  connectedUsers.forEach(usuario => { //modificando votos e valores para nulo(refresh na votação)
    if (usuario.isAdmin == true && usuario.refreshAdm == true) {
      refreshUsers = true
    }
  })
  if (refreshUsers) {
    connectedUsers.forEach((userData, userSocket) => {
      connectedUsers.set(userSocket, {
        ...userData,
        idxuser: null,
        votou: false,
        refreshAdm: false
      });
    });
  }
}


/////////////////////
function exibindoVotos(){
  connectedUsers.forEach(usuario => { //exibindo valores votados
    if (usuario.isAdmin == true && usuario.exibir == true) {
      exibirVotos = true
    } else if (usuario.isAdmin == true && usuario.exibir == false) {
      exibirVotos = false
    }
  })
  if (exibirVotos) {
    connectedUsers.forEach((userData, userSocket) => {
      connectedUsers.set(userSocket, {
        ...userData,
        exibir: true,
      });
    });
  }
  else {
    connectedUsers.forEach((userData, userSocket) => {
      connectedUsers.set(userSocket, {
        ...userData,
        exibir: false,
      });
    });
  }
}




//JSON 
let timestamp = Date.now();
let data = new Date(timestamp);
let formattedDate = data.toLocaleString();

function montandoRoom(){
  const room = {
    "Room": {
      "Name": connectedUsers.sectionName,
      "Id": connectedUsers.sectionId,
      "CreatedAt": formattedDate,
      "stories": [
        {
          "Title": "string",
          "Id": "guid",
          "Order": "int",
          "Voted": "bool",
          "Time": "timespan",
          "CreatedAt": "DateTime",
          "AvgPoints": "decimal",
          "TotalPoints": "decimal",
          "VotedHistories": [
            {
              "User": "guid",
              "Voted": "bool",
              "Vote": "decimal",
              "Time": "timespan"
            }
          ]
        }
      ],
      "users": [
        {
          "Id": connectedUsers.id,
          "Name": connectedUsers.name,
          "IsAdmin": connectedUsers.isAdmin
        }
      ]
    }
  };
}
