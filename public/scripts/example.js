/**
 * This file provided by Facebook is for non-commercial testing and evaluation purposes only.
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var CommentList = React.createClass({
    render: function () {
        var commentNodes = this.props.data.map(function (comment) {
            return (
                <Comment author={comment.author}>
                    {comment.text}
                </Comment>
            )
        });
        return (
            <div className="commentList">
                {commentNodes}
            </div>
        )
    }
});

var CommentForm = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();
        var author = React.findDOMNode(this.refs.author).value.trim();
        var text = React.findDOMNode(this.refs.text).value.trim();
        if (!text || !author) {
            return;
        }
        this.props.onCommentSubmit({author: author, text: text});
        React.findDOMNode(this.refs.author).value = '';
        React.findDOMNode(this.refs.text).value = '';
        return;
    },
    render: function () {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit} >
                <input type="text" placeholder="Your Name" ref="author"/>
                <input type="text" placeholder="Your Words" ref="text"/>
                <input type="submit" value="Post" />
            </form>
       );
    }
});

// https://facebook.github.io/react/docs/tutorial.html
// http://localhost:3000/

var CommentBox = React.createClass({
    getInitialState: function () {
        return {data: []};
    },
    loadCommentsFromServer: function () {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function (data) {
                this.setState({data: data});
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this),
        });
    },
    handleCommentSubmit: function (comment) {
        var comments = this.state.data;
        this.state.data.push(comment);
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function (data) {
                this.setState({data: data});
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this),
        });
    },
    componentDidMount: function () {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function () {
        return (
            <div className="commentBox">
                <h1> Box! </h1>
                <CommentList data={this.state.data} />
                <CommentForm onCommentSubmit={this.handleCommentSubmit} />
            </div>
       );
    }
});

var converter = new Showdown.converter();
var Comment = React.createClass({
    render: function () {
        return (
            <div className="comment">
                <h3 className="commentAuthor"> {this.props.author} </h3>
                { this.props.children }
            </div>
        );
    }
});

var data = [
    {author: "Pete Hunt", text: "This is one comment"},
    {author: "Jordan Walke", text: "This is *another* comment"}
];

React.render(
    <CommentBox url="comments.json" pollInterval={ 2000 }/>,
    document.getElementById('content')
);
