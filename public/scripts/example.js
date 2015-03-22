var projects = [
    {name: 'docker_multiflask_server', summary: 'Docker + docker compose + nginx + 2 * (gunicorn + flask)'},
    {name: 'koch_snowflake', summary: 'Examine the relationship between a fractal\'s volume and perimeter.'}
];

// https://facebook.github.io/react/docs/displaying-data.html


var ProjectGrid = React.createClass({
    render: function () {
        var projectBoxMaker = function (project) {
            return (
                <ProjectBox name={project.name} key={project.name}>
                    {project.summary}
                </ProjectBox>
            )
        }
        return (
            <div className="projectGrid">
                <h1> Featured Projects </h1>
                {this.props.projects.map(projectBoxMaker)}
            </div>
        )
    }
});

var converter = new Showdown.converter();
var ProjectBox = React.createClass({
    getInitialState: function () {
        return {readme: '', visible: false};
    },
    fetchReadme: function () {
        var projectName = this.props.name;
        var url = 'https://api.github.com/repos/sergeio/' + projectName + '/contents/readme.md?ref=master';
        $.ajax({
            url: url,
            dataType: 'json',
            success: function (data) {
                var text = window.atob(data.content)
                var readme_html = converter.makeHtml(text)
                this.setState({
                    readme: readme_html,
                    visible: true
                });
                // this.refs.children.getDOMNode().value = text;
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this),
        });
    },
    toggleReadme: function (e) {
        e.preventDefault();
        if (! this.state.readme ) {
            this.fetchReadme();
        } else {
            this.setState({
                readme:this.state.readme,
                visible: !this.state.visible
            });
        }
    },
    render: function () {
        var rawMarkup = (this.state.visible && this.state.readme) || '';
        return (
            <div className="projectBox">
                <h2>
                    <a href="#" onClick={this.toggleReadme}>
                        {this.props.name}
                    </a>
                </h2>
                <p> {!this.state.visible && this.props.children} </p>
                <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
            </div>
        )
    }
});


React.render(
    <ProjectGrid projects={projects} />,
    document.getElementById('content')
);
