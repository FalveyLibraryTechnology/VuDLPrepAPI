var VuDLPrep = {
    init: function (url, container) {
        this.url = url;
        this.container = container;
        this.buildJobSelector();
        this.buildPaginator();
    },

    buildJobSelector: function () {
        this.jobSelector = $('<div id="jobSelector"></div>');
        this.container.append(this.jobSelector);
        this.fetchJobs(this.jobSelector);
    },

    buildPaginator: function() {
        this.paginator = $('<div id="paginator"></div>');
        this.paginatorList = $('<div class="pageList"></div>');
        this.paginator.append(this.paginatorList);
        this.paginatorPreview = $('<div class="preview"></div>');
        this.paginator.append(this.paginatorPreview);
        this.paginatorControls = $('<div class="controls"></div>');
        this.paginator.append(this.paginatorControls);
        this.paginator.hide();
        this.container.append(this.paginator);
    },

    fetchJobs: function(target) {
        var that = this;
        jQuery.getJSON(this.url, null, function (data, status) {
            target.empty();
            for (var i = 0 ; i < data.length; i++) {
                var current = data[i];
                var currentCategory = current['category'];
                if (current['jobs'].length > 0) {
                    var currentElement = $('<div class="jobCategory"></div>');
                    currentElement.append($('<h2></h2>').text(currentCategory));
                    var currentList = $('<ul></ul>');
                    currentElement.append(currentList);
                    for (var j = 0; j < current['jobs'].length; j++) {
                        var currentItem = $('<li></li>');
                        var currentJob = current['jobs'][j];
                        var currentLink = $('<a href="#" />').text(currentJob);
                        currentLink.click(
                            that.getJobSelector(currentCategory, currentJob)
                        );
                        currentItem.append(currentLink);
                        currentList.append(currentItem);
                    }
                    target.append(currentElement);
                }
            }
        });
    },

    getJobSelector: function(category, job) {
        var that = this;
        return function () {
            return that.selectJob(category, job);
        }
    },

    getPageSelector: function(p) {
        var that = this;
        return function () {
            return that.selectPage(p);
        }
    },

    selectJob: function(category, job) {
        this.currentCategory = category;
        this.currentJob = job;
        this.jobSelector.hide();
        this.paginator.show();

        this.loadPageList(category, job, this.paginatorList);
    },

    getImageUrl: function(category, job, filename, size) {
        return this.getJobUrl(
            category, job,
            '/' + encodeURIComponent(filename) + '/' + encodeURIComponent(size)
        );
    },

    getJobUrl: function(category, job, extra) {
        return this.url + '/' + encodeURIComponent(category) + '/'
            + encodeURIComponent(job) + extra;
    },

    loadPageList: function(category, job, target) {
        var that = this;
        target.empty();
        jQuery.getJSON(this.getJobUrl(category, job, '/pagination'), null, function (data, status) {
            that.currentPageOrder = data['order'];
            that.thumbnails = [];
            for (var i = 0; i < data['order'].length; i++) {
                var currentThumb = $('<div class="thumbnail"></div>');
                currentThumb.click(that.getPageSelector(i));
                var currentImage = $('<img />');
                currentImage.attr('src', that.getImageUrl(category, job, data['order'][i]['filename'], 'thumb'))
                currentThumb.append(currentImage);
                var currentLabel = $('<div class="label"></div>').text(data['order'][i]['label']);
                currentThumb.append(currentLabel);
                target.append(currentThumb);
                that.thumbnails[i] = currentThumb;
            }
            that.selectPage(0);
        });
    },

    loadPreview: function(category, job, filename) {
        var currentImage = $('<img />');
        currentImage.attr(
            'src', this.getImageUrl(category, job, filename, 'medium')
        );
        this.paginatorPreview.empty();
        this.paginatorPreview.append(currentImage);
    },

    selectPage: function(p) {
        this.currentPage = p;
        this.loadPreview(
            this.currentCategory, this.currentJob, this.currentPageOrder[p]['filename']
        );
    }
};