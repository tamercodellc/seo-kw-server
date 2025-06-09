const IO = class {
	constructor(io) {
		this.io = io;
		this.sessions = new Map();
		this.rooms = new Map();
	}

	findSession(id) {
		return this.sessions.get(id);
	}

	saveSession(id, session) {
		this.sessions.set(id, session);
	}

	deleteSession(id) {
		this.sessions.delete(id)
	}

	findAllSessions() {
		return [...this.sessions.values()];
	}

	joinRoom(socketId, roomName) {
		this.io.sockets.sockets.get(socketId).join(roomName);
		if (!this.rooms.has(roomName)) {
			this.rooms.set(roomName, []);
		}
		this.rooms.get(roomName).push(socketId);
	}

	leaveRoom(socket, roomName) {
		socket.leave(roomName);
		if (this.rooms.has(roomName)) {
			const index = this.rooms.get(roomName).indexOf(socket.id);
			if (index !== -1) {
				this.rooms.get(roomName).splice(index, 1);
				if (this.rooms.get(roomName).length === 0) {
					this.rooms.delete(roomName);
				}
			}
		}
	}

	emitToRoom(eventName, roomName, data) {
		this.io.to(+roomName).emit(eventName, data);
	}

	emitToUser(id, eventName, data) {
		// const socketId = this.sessions.get(+id)
		this.io.to(id).emit(eventName, data);
	}
}

module.exports = IO;