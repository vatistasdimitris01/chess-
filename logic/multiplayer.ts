
export class ChessSync {
  private channel: BroadcastChannel | null = null;
  private roomId: string | null = null;

  connect(roomId: string, onMessage: (data: any) => void) {
    this.roomId = roomId;
    this.channel = new BroadcastChannel(`chess_room_${roomId}`);
    this.channel.onmessage = (event) => onMessage(event.data);
  }

  sendMove(from: string, to: string, fen: string, promotion?: string) {
    if (this.channel) {
      this.channel.postMessage({ type: 'MOVE', from, to, fen, promotion });
    }
  }

  sendReset(fen: string) {
    if (this.channel) {
      this.channel.postMessage({ type: 'RESET', fen });
    }
  }

  disconnect() {
    this.channel?.close();
    this.channel = null;
  }

  static generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
