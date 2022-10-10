/* eslint-disable no-unused-vars */
const line = require('@line/bot-sdk');
const dayjs = require('dayjs');
const { SENDED, SENDING, FAILED } = require('../../constants/AppointmentStatus').STATUS;
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

  async sendFlexMessage(lineUid, appointName, appointLocation = "-", appointmentDate, appointmentId) {
    let { start_at, end_at } = appointmentDate
    const altText = 'แจ้งเตือนการนัดหมายจาก PETHUG'
    await this.app.service('appointment-service').updateAppointmentNotification(appointmentId, SENDING)
    let result
    try {
      result = await this.lineClient.pushMessage(lineUid, {
        type: 'flex',
        altText: altText,
        contents: {
          type: "bubble",
          hero: {
            type: "image",
            url: "https://i.imgur.com/BPebLLC.png",
            size: "full",
            aspectRatio: "20:13",
            aspectMode: "cover",
            action: {
              type: "uri",
              label: "Line",
              uri: "https://linecorp.com/"
            }
          },
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: appointName,
                weight: "bold",
                size: "xl",
                contents: []
              },
              {
                type: "box",
                layout: "vertical",
                spacing: "sm",
                margin: "lg",
                contents: [
                  {
                    type: "box",
                    layout: "baseline",
                    spacing: "sm",
                    contents: [
                      {
                        type: "text",
                        text: "สถานที่",
                        size: "sm",
                        color: "#AAAAAA",
                        contents: []
                      },
                      {
                        type: "text",
                        text: appointLocation,
                        size: "sm",
                        color: "#666666",
                        flex: 3,
                        wrap: true,
                        contents: []
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "baseline",
                    contents: [
                      {
                        type: "text",
                        text: "วันที่",
                        size: "sm",
                        color: "#AAAAAA",
                        contents: []
                      },
                      {
                        type: "text",
                        text: dayjs(start_at).format('DD/MM/YYYY'),
                        size: "sm",
                        color: "#666666",
                        flex: 3,
                        contents: []
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "baseline",
                    spacing: "sm",
                    contents: [
                      {
                        type: "text",
                        text: "เวลา",
                        size: "sm",
                        color: "#AAAAAAFF",
                        contents: []
                      },
                      {
                        type: "text",
                        text: `${dayjs(start_at).format('HH:mm')} - ${dayjs(end_at).format('HH:mm')}`,
                        size: "sm",
                        color: "#666666",
                        flex: 3,
                        wrap: true,
                        contents: []
                      }
                    ]
                  }
                ]
              }
            ]
          },
          footer: {
            type: "box",
            layout: "vertical",
            flex: 0,
            spacing: "sm",
            contents: [
              {
                type: "button",
                action: {
                  type: "uri",
                  label: "WEBSITE",
                  uri: "https://dev.pethug-project.com/"
                },
                height: "sm",
                style: "link"
              },
              {
                type: "spacer",
                size: "sm"
              }
            ]
          }
        }
      })
    } catch (error) {
      console.log(error)
      await this.app.service('appointment-service').updateAppointmentNotification(appointmentId, FAILED)
    }

    if (result) {
      await this.app.service('appointment-service').updateAppointmentNotification(appointmentId, SENDED)
    }
    return result
  }

};
