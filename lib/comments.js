const Comment = require('./comment');

class Comments {
  constructor() {
    this.entities = [];
  }
  addComment(comment) {
    this.entities.unshift(comment);
  }
  toHtml() {
    return this.entities.map(comment => comment.toHtml()).join('');
  }
  static load(content) {
    const commentList = JSON.parse(content || '[]');
    const comments = new Comments();
    commentList.forEach(cmnt => {
      comments.addComment(new Comment(cmnt.name, cmnt.commentMsg, cmnt.time));
    });
    return comments;
  }
  toJSON() {
    return JSON.stringify(this.entities);
  }
}

module.exports = Comments;
