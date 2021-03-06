
// https://facebook.github.io/react/docs/displaying-data.html
var converter = new Showdown.converter();

var Page = React.createClass({
    render: function () {
        return (
            <div className='page'>
                <ProjectGrid dataUrl={this.props.projectDataUrl} />
                <SideBar dataUrl={this.props.sidebarDataUrl} />
            </div>
        )
    }
});

var ProjectGrid = React.createClass({
    getInitialState: function () {
        return {data: []};
    },
    fetchProjects: function () {
        $.ajax({
            url: this.props.dataUrl,
            dataType: 'json',
            success: function (data) {
                this.setState({data: data});
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.dataUrl, status, err.toString());
            }.bind(this),
        });
    },
    render: function () {
        var projectBoxMaker = function (project) {
            return (
                <ProjectBox
                    name={project.name}
                    title={project.title}
                    key={project.name}>
                        {project.summary}
                </ProjectBox>
            )
        }
        return (
            <div className="projectGrid">
                {this.state.data.map(projectBoxMaker)}
            </div>
        )
    },
    componentDidMount: function () {
        this.fetchProjects();
    },
});

var SideBar = React.createClass({
    getInitialState: function () {
        return {markdown: '', rawHtml: ''};
    },
    fetchSidebarText: function () {
        $.ajax({
            url: this.props.dataUrl,
            dataType: 'text',
            success: function (data) {
                this.setState({
                    markdown: data,
                    rawHtml: converter.makeHtml(data)
                });
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.dataUrl, status, err.toString());
            }.bind(this),
        });
    },
    componentDidMount: function () {
        this.fetchSidebarText();
    },
    render: function () {
        return (
            <div className='sideBar contentBox'>
                <span dangerouslySetInnerHTML={{__html: this.state.rawHtml}} />
            </div>
        )
    }
});

var RemoveH1Title = function (htmlString) {
    // We don't want two H1 Titles
    var expr = '<h1[^\<]*</h1>';
    var re = new RegExp(expr, 'g');
    htmlString = htmlString.replace(re, '');
    return htmlString
}

var handleRelativeImages = function (htmlString, projectName) {
    // Replaces all images in htmlString assuming they have paths relative to a
    // github project.
    var prefix = '<img src="https://raw.githubusercontent.com/sergeio/';
    var expr = '<img src="([^"]*)"';
    var re = new RegExp(expr, 'g');
    var replaceWith = prefix + projectName + '/master/$1"';
    htmlString = htmlString.replace(re, replaceWith);
    return htmlString
}

var Buttons = React.createClass({
    render: function () {
        var prefix = 'http://github.com/sergeio/'
        var style = {display: 'inline'};
        if (this.props.orientation == 'bottom' && !this.props.visible) {
            style = {display: 'none'};
        }
        var shouldScroll = this.props.orientation == 'bottom';
        return (
            <div
                className={'buttons buttons-' + this.props.orientation}
                style={style}>
                    <a href={prefix + this.props.projectName} />
                    <button
                        onClick={this.props.actionFactory(shouldScroll)}
                        title="Toggle long description">
                            {this.props.visible ? '⬆' : '⬇'}
                    </button>
            </div>
        )
    }
});

var ProjectBox = React.createClass({
    getInitialState: function () {
        return {readme: '', visible: false};
    },
    fetchReadme: function () {
        var projectName = this.props.name;
        var url = 'https://api.github.com/repos/sergeio/' +
            projectName + '/contents/README.md?ref=master';
        $.ajax({
            url: url,
            dataType: 'json',
            success: function (data) {
                var text = window.atob(data.content);
                var readmeHtml = converter.makeHtml(text);
                var readmeHtml = handleRelativeImages(readmeHtml, projectName);
                var readmeHtml = RemoveH1Title(readmeHtml);
                this.setState({
                    readme: readmeHtml,
                    visible: true
                });
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(url, status, err.toString());
            }.bind(this),
        });
    },
    toggleReadmeFactory: function (setScroll) {
        return function () {
            elmnt = $('#' + this.props.name);
            var visiblePortionHeight =
                elmnt.offset().top + elmnt.height() - window.scrollY;
            if (! this.state.readme ) {
                this.fetchReadme();
            } else {
                this.setState({
                    readme: this.state.readme,
                    visible: !this.state.visible,
                    scroll: setScroll? visiblePortionHeight : null
                });
            }
            elmnt = $('#' + this.props.name);
            // Toggle highlighting to help keep your place after scrolling
            elmnt.toggleClass('highlighted');
            setTimeout(function () {elmnt.toggleClass('highlighted')}, 500);
        }.bind(this)
    },
    componentDidUpdate: function () {
        if ( this.state.scroll && !this.state.visible ) {
            elmnt = $('#' + this.props.name);
            yScroll = elmnt.offset().top + elmnt.height() - this.state.scroll;
            window.scrollTo(0, yScroll);
        }
    },
    render: function () {
        var rawHtml = this.state.visible ? this.state.readme : '';
        return (
            <div className="projectBox contentBox" id={this.props.name}>
                <h2> {this.props.title} </h2>
                <Buttons
                    projectName={this.props.name}
                    actionFactory={this.toggleReadmeFactory}
                    orientation={'top'}
                    visible={this.state.visible} />
                {this.state.visible ? '' : this.props.children}
                <span dangerouslySetInnerHTML={{__html: rawHtml}} />
                <Buttons
                    projectName={this.props.name}
                    actionFactory={this.toggleReadmeFactory}
                    orientation={'bottom'}
                    visible={this.state.visible} />
            </div>
        )
    }
});


React.render(
    <Page
        projectDataUrl="public/projects.json"
        sidebarDataUrl="public/sidebar.md" />,
    document.getElementById('content')
);

// http://facebook.github.io/react/tips/communicate-between-components.html
// http://facebook.github.io/react/tips/expose-component-functions.html
// https://github.com/jlongster/transducers.js
