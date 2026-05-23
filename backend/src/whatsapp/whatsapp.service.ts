import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private url = process.env.EVOLUTION_API_URL!;
  private key = process.env.EVOLUTION_API_KEY!;
  private instance = process.env.EVOLUTION_INSTANCE!;

  async sendText(phone: string, message: string): Promise<void> {
    try {
      await axios.post(
        `${this.url}/message/sendText/${this.instance}`,
        { number: phone, text: message },
        { headers: { apikey: this.key } },
      );
      this.logger.log(`WhatsApp -> ${phone}`);
    } catch (e: any) {
      this.logger.error(`Falha WhatsApp ${phone}: ${e.message}`);
    }
  }
}
