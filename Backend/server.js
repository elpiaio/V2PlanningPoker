const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server\n');
});

const wss = new WebSocket.Server({ server });

const connectedUsers = new Map();

wss.on('connection', (ws) => {
  // Evento para lidar com mensagens recebidas
  ws.on('message', (message) => {
    try {
      const userObject = JSON.parse(message);

      // Adiciona o usuário à lista de usuários conectados
      if (userObject.idxuser != null) {
        connectedUsers.set(ws, {
          name: userObject.name,
          id: userObject.id,
          votou: true,
          idxuser: userObject.idxuser,
          isAdmin: userObject.isAdmin
        });
      } else {
        connectedUsers.set(ws, {
          name: userObject.name,
          id: userObject.id,
          votou: userObject.votou,
          idxuser: userObject.idxuser,
          isAdmin: userObject.isAdmin
        });
      }

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
  // Converte a lista de usuários para um array de objetos
  const userList = Array.from(connectedUsers.values()).map((user) => {
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