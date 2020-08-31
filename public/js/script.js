(function () {
    Vue.component('image-component', {
        template: '#template',
        props: ['imageId'],
        data: function () {
            return {
                count: 0,
                comment: '',
                usernamecomment: '',
                //selectedImageInfo: [],
                selectedtitle: '',
                selectedurl: '',
                selectedusername: '',
                selecteddescription: '',
                selectedcreatedat: '',
                selectedcomment: '',
                selectedcommentuser: '',
                selectedcommentcreatedate: '',
                selectedimageId: '',
                oldcomments: []

            }
        },
        mounted: function () {
            var self = this;
            //self.imageId
            console.log('this', this)
            console.log('mounted:', self.imageId)
            // imageId = this.id;
            // console.log('imageId::::', imageId)
            // var selectedImageId = this.id;

            axios.get(`/image/${self.imageId}`).then(function (response) {
                console.log('response in get./image: ', response.data);
                //self.selectedImageInfo.push(response.data);
                self.selectedtitle = response.data.title;
                self.selectedurl = response.data.url;
                self.selectedusername = response.data.username;
                self.selecteddescription = response.data.description;
                self.selectedcreatedat = response.data.created_at;
                self.selectedimageId = response.data.id;
                console.log('selectedimageId:: ', self.selectedimageId)
                console.log('response.data.length::', response.data.length)
                if (response.data.length == 0) {
                    self.$emit('close');
                }

            }).catch(err => {
                console.log('Error: ', err);
            })
            //////////////////////////////////////////////////////////////////////////////
            axios.get(`/comment/${self.imageId}`).then(function (response) {
                console.log('response in get/comment: ', response.data)
                self.selectedcomment = response.data.comment;
                self.selectedcommentuser = response.data.username;
                self.selectedcommentcreatedate = response.data.createdate;

                self.oldcomments = response.data;
                console.log('oldcomments::::', self.oldcomments)

            }).catch(err => {
                console.log('Error: ', err);
            })
        },

        watch: {
            imageId: function (e) {
                console.log('imageId before watch ', this.selectedimageId);
                console.log('watch::: changed #', e)
                if (this.selectedimageId !== e) {
                    var self = this;
                    axios.get(`/image/${self.imageId}`).then(function (response) {
                        console.log('response in get./image: ', response.data);
                        //self.selectedImageInfo.push(response.data);
                        self.selectedtitle = response.data.title;
                        self.selectedurl = response.data.url;
                        self.selectedusername = response.data.username;
                        self.selecteddescription = response.data.description;
                        self.selectedcreatedat = response.data.created_at;
                        self.selectedimageId = response.data.id;
                        console.log('selectedimageId:: ', self.selectedimageId)
                        if (response.data.length == 0) {
                            self.$emit('close');
                        }
                    }).catch(err => {
                        console.log('Error: ', err);
                        //this.$emit('close', this.count);
                    })
                } else {

                };
            }
        },

        methods: {
            exit: function () {
                this.$emit('close', this.count);
                // this.selected = true;
            },

            send: function (e) {
                console.log('submit-button was clicked')
                e.preventDefault();
                console.log('e.target', e.value)
                console.log('this.comment', this.comment)
                var obj = {};
                obj.comment = this.comment;
                obj.userName = this.usernamecomment;
                obj.imageId = this.imageId;
                console.log('obj', obj)
                var self = this;
                //////////////////////////////////////////////////////////////////////////////////////
                axios.post('/comment', obj).then(function (response) {
                    console.log('comment post')
                    self.oldcomments.unshift(response.data);
                    console.log('response.dta', response.data)
                }).catch(err => {
                    console.log('Error: ', err);
                })
            }
        }
    });

    /////////////////////////////////// Vue instance ////////////////////////////////////////


    new Vue({
        el: '#main',
        data: {
            cards: [],
            //data properties to handle input
            title: '',
            description: '',
            username: '',
            file: null,
            selected: false,
            imageId: location.hash.slice(1),
            seen: true

        },
        mounted: function () {
            console.log('Vue mounted')
            console.log('this inside mounted:', this)
            var self = this;
            axios.get('/cards').then(function (response) {
                if (isNaN(location.hash.slice(1))) {
                    console.log('hash is not a number')
                    self.$emit('close');
                } else {
                    console.log('response in axios get/cards:::::::::: ', response.data)
                    console.log(response.data)
                    self.cards = response.data;
                }


                /*if (response.data.length == 0) {
                    self.$emit('close');
                }*/

            }).catch(err => {
                console.log('err: ', err)
            });

            window.addEventListener('hashchange', function () {
                console.log('hashchange')
                console.log('location hash::', location.hash.slice(1))
                console.log('self.imageId in hash', self.imageId)
                self.imageId = location.hash.slice(1);

                ///////////////////////////////////////////////////////////
                if (isNaN(location.hash.slice(1))) {
                    console.log('hash is not a number')
                    self.$emit('close');
                }
                /////////////////////////////////////////////////////////////
            })

        },


        methods: {


            handleClick: function (e) {
                console.log('submit-button was clicked')
                e.preventDefault();
                console.log('this: ', this)

                var formData = new FormData();
                formData.append('title', this.title);
                formData.append('description', this.description);
                formData.append('username', this.username);
                formData.append('file', this.file)
                //console.log formData will always be emptyobject
                var self = this
                //var thisOfData = this;
                axios.post('/upload', formData).then(function (resp) {
                    console.log('resp from Post/upload:', resp.data)
                    //thisOfData.title = thisOfData.description = thisOfData.username = thisOfData.file = '';
                    self.cards.unshift(resp.data);


                }).catch(function (err) {
                    console.log('err in POST', err)
                })
            },

            handleChange: function (e) {
                console.log('handle is running...user choose a file')
                console.log('files: ', e.target.files[0])
                //
                this.file = e.target.files[0];
            },

            ////////////////////////////////////////////////////////////////////////////

            closeModal: function () {
                this.imageId = false;
                location.hash = '';

            },

            more: function () {
                var self = this
                var arr = [];
                console.log('self.cards in more', self.cards)
                for (var i = 0; i < self.cards.length; i++) {
                    arr.push(self.cards[i].id)
                }
                console.log('arr', Math.min(...arr));
                var minId = Math.min(...arr);

                axios.get(`/more/${minId}`).then(function (response) {
                    //console.log('response in axios /more:::::::::: ', response.data);
                    //console.log('response.data[response.data.length - 1].id', response.data[response.data.length - 1].id);
                    //console.log('response.data[2].lowestId', response.data[2].lowestId)
                    self.cards.push(...response.data);
                    if (response.data[response.data.length - 1].id === 1) {
                        self.seen = false;
                    }

                }).catch(err => {
                    console.log('err: ', err)
                });

                //if (minId ===  response.data[0].lowestId )

            }
        },
    });

})();


 // imageInModal: function (image) {
            //     //var self = this;
            //     this.selected = true;
            //     console.log('click image in imageInModal--->', image);
            //     this.imageId = image;
            //     console.log('imageId::::', imageId)
            // },