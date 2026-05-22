export class CreateOrderItemDto {
  bookId: string;
  quantity: number;
}

export class CreateOrderDto {
  items: CreateOrderItemDto[];
  shippingAddress: string;
  phone: string;
  paymentMethod: 'cash' | 'transfer';
  shippingFee?: number;
}
