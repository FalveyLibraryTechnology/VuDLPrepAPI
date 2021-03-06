var VuDLPrep = React.createClass({
    activateJobSelector: function() {
        this.refs.paginator.setState(this.refs.paginator.getInitialState());
        this.refs.selector.show();
    },

    getImageUrl: function(category, job, filename, size) {
        return this.getJobUrl(
            category, job,
            '/' + encodeURIComponent(filename) + '/' + encodeURIComponent(size)
        );
    },

    getJobUrl: function(category, job, extra) {
        return this.props.url + '/' + encodeURIComponent(category) + '/'
            + encodeURIComponent(job) + extra;
    },

    selectJob: function (category, job) {
        this.refs.selector.hide();
        this.refs.paginator.loadJob(category, job);
    },

    ajax: function(params) {
        params.beforeSend = function (xhr) {
            xhr.setRequestHeader('Authorization', 'Token ' + this.props.token);
        }.bind(this);
        $.ajax(params);
    },

    getJSON: function(url, data, success) {
        this.ajax({
          dataType: "json",
          url: url,
          data: data,
          success: success
        });
    },

    render: function() {
        var logout = this.props.logoutUrl
            ? <div className="logout"><a href={this.props.logoutUrl} className="button">Log Out</a></div>
            : '';
        return (
            <div>
                {logout}
                <JobSelector app={this} ref="selector" onJobSelect={this.selectJob} url={this.props.url} />
                <JobPaginator app={this} ref="paginator" />
            </div>
        );
    }
});