let io;

module.exports = {
    getIO: () => {
      if (!io) {
        throw new Error('Socket.io not initialized!');
      }
      return io;
    }
  };