import { Schema, model } from 'mongoose';

interface ITransaction {
  propertyId: Schema.Types.ObjectId;
  tenantId: Schema.Types.ObjectId;
  landlordId: Schema.Types.ObjectId;
  amount: number;
  type: 'rent' | 'deposit' | 'fee';
  status: 'pending' | 'completed' | 'failed';
  date: Date;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  landlordId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['rent', 'deposit', 'fee'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  date: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const TransactionModel = model<ITransaction>('Transaction', transactionSchema); 