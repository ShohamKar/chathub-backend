import mongoose from 'mongoose'

let chatSchema = new mongoose.Schema({
  chatName: {
    type: String,
    trim: true,
    required: [true, 'Chat must have a name']
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})


export default mongoose.model('Chat', chatSchema)