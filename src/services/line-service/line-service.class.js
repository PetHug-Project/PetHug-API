/* eslint-disable no-unused-vars */
const line = require('@line/bot-sdk');
const { SENDED, SENDING } = require('../../constants/AppointmentStatus').STATUS;
exports.LineService = class LineService {
  constructor(options, app) {
    this.options = options || {};
    this.app = app
    this.lineClient = new line.Client({
      channelAccessToken: this.app.get('line_channel_access_token'),
      channelSecret: this.app.get('line_channel_secret')
    })
  }

  async find(params) {
    return [];
  }

  async get(id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async create(data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }

  async update(id, data, params) {
    return data;
  }

  async patch(id, data, params) {
    return data;
  }

  async remove(id, params) {
    return { id };
  }

  async sendMessage(lineUid, message) {
    let result = await this.lineClient.pushMessage(lineUid, {
      type: 'text',
      text: message
    });
    return result
  }

  async sendFlexMessage(lineUid, appointName, appointDescription, appointmentId) {
    const altText = 'แจ้งเตือนการนัดหมายจาก PETHUG'
    await this.app.service('appointment-service').updateAppointmentNotification(appointmentId, SENDING)
    let result = await this.lineClient.pushMessage(lineUid, {
      type: 'flex',
      altText: altText,
      contents: {
        type: "bubble",
        size: "giga",
        direction: "ltr",
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "คุณมีการนัดหมาย",
              weight: "bold",
              align: "center",
              contents: []
            }
          ]
        },
        hero: {
          type: "image",
          url: "https://vos.line-scdn.net/bot-designer-template-images/bot-designer-icon.png",
          size: "full",
          aspectRatio: "1.51:1",
          aspectMode: "fit"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `หัวข้อ : ${appointName}`,
              weight: "bold",
              size: "xxl",
              align: "center",
              wrap: true,
              contents: []
            }
          ]
        },
        footer: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: `เนื้อหา: ${appointDescription}`,
              weight: "regular",
              size: "xxl",
              align: "center",
              wrap: true,
              contents: []
            }
          ]
        }
      }
    });
    if (result) {
      await this.app.service('appointment-service').updateAppointmentNotification(appointmentId, SENDED)
    }
    return result
  }

};
