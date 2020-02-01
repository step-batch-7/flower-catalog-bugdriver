class Comment {
  constructor(name, commentMsg, time) {
    this.name = name;
    this.commentMsg = commentMsg;
    this.time = time;
  }
  toHtml() {
    return `<tr>
              <td>${this.name}</td>
              <td>${this.commentMsg.replace(/\r\n/g, '</br>')}</td>
              <td>${this.time}</td>
            </tr>`;
  }
}

module.exports = Comment;
