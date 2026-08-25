import mongoose from 'mongoose';

const telegramSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'authenticated'],
    default: 'pending',
  },
  user: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // auto-delete after 10 minutes (TTL index)
  },
});

const TelegramSession = mongoose.model('TelegramSession', telegramSessionSchema);

export default TelegramSession;
