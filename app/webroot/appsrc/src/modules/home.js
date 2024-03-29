define([
  'app',
  'Handlebars',
  'data/data',

  'bootstrap',
  'jqueryui'
],

function(App, Handlebars, Data) {
  var Home = {};

  Home.Layout = Backbone.Layout.extend({
    initialize : function () {
      var self = this;
    }
  });

  Home.OrganizationView = Backbone.View.extend({
    initialize: function () {
      var self = this;
    },
    unload: function() {
      this.remove();
      this.unbind();
    },
    afterRender: function() {
      var self = this;

      $('#editOrganizationModal').modal('show');
      $('#editOrganizationModal').find('#name').val(window.oCurrentUser.organization.name);
      $('#editOrganizationModal').find('img').attr('src', window.oCurrentUser.organization.logo);
      $('#editOrganizationModal').find('#logo_source').val(window.oCurrentUser.organization.logo);

      window.iOrganizationId = window.oCurrentUser.organization.id;
      $('.uploadPicButton').unbind('click').click(function() {
        $('.uploadPic').click();
        $('.uploadPic').change(function() {
          $(this).upload('/dfcusa-pm/api/organization/' + window.iOrganizationId + '/upload', function(res) {
            oRes = $.parseJSON(res.substring(res.indexOf("{"), res.lastIndexOf("}") + 1));
            $('#editOrganizationModal').find('#logo_source').val(oRes.file);
           }, 'html');
        });
      });

      $('#editOrganizationModal').find('.saveOrganization').unbind('click').click(function() {
        self.saveOrganization();
      });

      App.setupPage();
    },
    saveOrganization: function() {
      var self = this;

      if ($('#editOrganizationModal').find('#name').val() != '') {
        self.oOrganization = new Data.Models.OrganizationModel();
        self.oOrganization.attributes.name = $('#editOrganizationModal').find('#name').val();
        self.oOrganization.attributes.logo = $('#editOrganizationModal').find('#logo_source').val();
        self.oOrganization.save({}, {success: function(data) {
          $('#editOrganizationModal').modal('hide');
          app.showNotify('Saved organization', 'success');
          window.location.href = '/home#projects';
        }, error: function() {
          app.showNotify('Error saving organization', 'error');
        }});
      } else {
        $('#editOrganizationModal').find('.error-span').removeClass('hide');
      }
    }
  });

  Home.ProfileView = Backbone.View.extend({
    initialize: function () {
      var self = this;
    },
    unload: function() {
      this.remove();
      this.unbind();
    },
    afterRender: function() {
      var self = this;

      $('#editProfileModal').modal('show');
      $('#editProfileModal').find('#first_name').val(window.oCurrentUser.first_name);
      $('#editProfileModal').find('#last_name').val(window.oCurrentUser.last_name);
      $('#editProfileModal').find('#email').val(window.oCurrentUser.email);
      $('#editProfileModal').find('#location').val(window.oCurrentUser.location);
      $('#editProfileModal').find('.profilePic').attr('src', window.oCurrentUser.profilepic);
      $('#editProfileModal').find('#profile_pic_source').val(window.oCurrentUser.profilepic);

      $('.uploadPicButton').unbind('click').click(function() {
        debugger;
        $('.uploadPic').click();
        $('.uploadPic').change(function() {
          $(this).upload('/dfcusa-pm/api/user/' + window.oCurrentUser.id + '/upload', function(res) {
            oRes = $.parseJSON(res.substring(res.indexOf("{"), res.lastIndexOf("}") + 1));
            $('#editProfileModal').find('#profile_pic_source').val(oRes.file);
           }, 'html');
        });
      });

      $('#editProfileModal').find('.saveProfile').unbind('click').click(function() {
        self.saveProfile();
      });

      App.setupPage();
    },
    saveProfile: function() {
      var self = this;

      bContinue = true;

      if ($('#editProfileModal').find('#first_name').val() == '') {
        bContinue = false
        $('#editProfileModal').find('#first_name').parent().find('.error-span').removeClass('hide');
      }

      if ($('#editProfileModal').find('#last_name').val() == '') {
        bContinue = false
        $('#editProfileModal').find('#last_name').parent().find('.error-span').removeClass('hide');
      }

      if ($('#editProfileModal').find('#email').val() == '') {
        bContinue = false
        $('#editProfileModal').find('#email').parent().find('.error-span').removeClass('hide');
      }

      if ($('#editProfileModal').find('#location').val() == '') {
        bContinue = false
        $('#editProfileModal').find('#location').parent().find('.error-span').removeClass('hide');
      }

      if (bContinue) {
        self.oUser = new Data.Models.UserModel();
        self.oUser.attributes.id = window.oCurrentUser.id;
        self.oUser.attributes.first_name = $('#editProfileModal').find('#first_name').val();
        self.oUser.attributes.last_name = $('#editProfileModal').find('#last_name').val();
        self.oUser.attributes.email = $('#editProfileModal').find('#email').val();
        self.oUser.attributes.location = $('#editProfileModal').find('#location').val();
        self.oUser.attributes.password = $('#editProfileModal').find('#password').val();
        self.oUser.attributes.profilepic = $('#editProfileModal').find('#profile_pic_source').val();
        self.oUser.url = '/dfcusa-pm/api/user';
        self.oUser.save({}, {success: function(data) {
          $('#editProfileModal').modal('hide');
          app.showNotify('Saved profile', 'success');
          window.location.href = '/home#projects';
        }, error: function() {
          app.showNotify('Error saving profile', 'error');
        }});
      }
    }
  });

  Home.ProjectsView = Backbone.View.extend({
    initialize: function () {
      var self = this;
      self.getProjects();
    },
    unload: function() {
      this.remove();
      this.unbind();
    },
    afterRender: function () {
      var self = this;

      $('.leftnav').addClass('hide');
      $('#projectHeader').addClass('hide');
      $('.inner_nav').find('a').removeClass('active');
      $('.myprojects').addClass('active');
      $('#navbar_fids').addClass('hide');
      $('#main_menu').removeClass('pull-right');
      $('#project_name').addClass('hide');
      App.setupPage();
    },
    getProjects: function() {
      var self = this;
      self.user = App.HomeRouter.models.user;
      self.user.fetch({success: function() {
        self.showProjects();
      }});
    },
    showProjects: function() {
      var self = this;

      bFound = false;

      $('#content').html(Handlebars.compile($('#welcomeViewTemplate').html()));

      self.projects = new Data.Collections.Projects();
      self.projects.url = '/dfcusa-pm/api/organization/' + self.user.attributes.organization_id + '/projects';
      self.projects.fetch({success: function() {
        if (self.projects.models.length > 0) {
          $('#content').html(Handlebars.compile($('#projectsListTemplate').html()));
          _.each(self.projects.models, function(project) {
            bDeleteable = false;

            if ((project.attributes.mentor) && (window.oCurrentUser.id == project.attributes.mentor.id)) bDeleteable = true;

            if (window.oCurrentUser.master_mentor == 1) bDeleteable = true;
            $('#content').find('.projectsList').append(Handlebars.compile($('#projectMainTabletTemplate').html())({organization: self.user.attributes.organization, project: project.attributes, deletable: bDeleteable}));
            bFound = true;
          });

          $('#title').html(self.user.attributes.organization.name + ' Projects');

          $('.newProject').unbind('click').click(function() {
            self.newProject();
          });

          $('.deleteProject').unbind('click').click(function() {
            window.projectId = $(this).attr('data-id');
            if (App.alertBox('Delete Project', 'Are you sure you want to delete this project?', 'Yes', 'Cancel', function() {
              oNewProject = new Data.Models.ProjectModel();
              oNewProject.id = window.projectId;
              oNewProject.url = '/dfcusa-pm/api/project/' + window.projectId;
              oNewProject.destroy({success: function() {
                self.getProjects();
              }});
            }));
          });
        }
      }});

      if (bFound == false) {
        self.content = new Data.Models.ContentModel();
        self.content.url = '/dfcusa-pm/api/content/welcome';
        self.content.fetch({success: function() {

          $('#content').find('.modal-body').html(self.content.attributes.content_obj.content);
          $('.newProject').unbind('click').click(function() {
            self.newProject();
          });
        }});
      }

      $('.uploadFiles').addClass('hide');
    },
    newProject: function() {
      console.log('test');
      var self = this;
      $('#newProjectModal').modal().on('shown.bs.modal', function (e) {
        $('#newProjectModal').find('.carousel').carousel();
        $('.existingNewProject').unbind('click').click(function() {
          $('#newProjectModal').modal('hide');
          self.newExistingProject();
        });
        $('.blankNewProject').unbind('click').click(function() {
          $('#newProjectModal').modal('hide');
          self.newBlankProject();
        });
      });
    },
    newBlankProject: function() {
      oNewProject = new Data.Models.ProjectModel();
      oNewProject.attributes.name = 'New Project';
      oNewProject.attributes.profilepic = '';
      oNewProject.save({}, {success: function(data) {
        App.HomeRouter.navigate('project/' + data.attributes.id, {trigger: true});
      }, error: function() {
        alert('Error creating project, perhaps a project with the same name already exists.');
      }});
    },
    newExistingProject: function() {
      console.log('test');
      $('#existingNewProjectModal').modal().on('shown.bs.modal', function (e) {
        $('#existingNewProjectModal').find('.carousel').carousel();
        $('.createProject').unbind('click').click(function() {
          $('#existingNewProjectModal').modal('hide');
          $('#checkFidsModal').modal('show');
          $('.saveFidsCheck').unbind('click').click(function(){
            var stageSelect = $('#checkFidsModal').find('.active').text().replace(/\s+/g, '').toLowerCase();
            $('#checkFidsModal').modal('hide');


            if (App.checkForm('#newProjectForm')) {
              oNewProject = new Data.Models.ProjectModel();
              oNewProject.attributes = App.mapFormToModel($('#newProjectForm'));
              oNewProject.attributes.profilepic = '/dfcusa-pm/app/webroot/assets/projects/' + $('#existingNewProjectModal').find('.carousel-indicators').find('.active').attr('data-image');
            debugger;
              oNewProject.save({}, {success: function(data) {
                App.HomeRouter.navigate('project/' + data.attributes.id + '/'+ stageSelect, {trigger: true});

              }, error: function() {
                alert('Error creating project, perhaps a project with the same name already exists.');
              }});
            } else {
              return false;
            }
          });
        });
      });
    }
  });

  Home.ProjectView = Backbone.View.extend({
    iProjectId: false,
    sStage: 'home',
    sSection: 'home',
    initialize: function () {
      var self = this;
    },
    unload: function() {
      this.remove();
      this.unbind();
    },
    afterRender: function () {
      var self = this;


      $('#content').html($('#contentTemplate').html());
      self.project = new Data.Models.ProjectModel();
      self.project.url = '/dfcusa-pm/api/project/' + self.iProjectId;
      // debugger;
      self.project.fetch({success: function() {
        self.showProject();
      }});
    },
    showProject: function() {
      var self = this;
      // var windowhash = window.location.hash.split('/');
      // var curStage =  window.location.hash.split('/');
      // curStage = curStage[2];
      // var stageComplete = localStorage.getItem('stageComplete');
      // console.log(stageComplete);

      // if(curStage == "feel"){
      //   curStage = 1;
      // }else if (curStage == "imagine"){
      //   curStage = 2;
      // }else if (curStage == "do"){
      //   curStage = 3;
      // }else if(curStage == "share" || windowhash[3] == "files" || stageComplete == 'true'){
      //   curStage = 4;
      // }else{
      //   curStage = 0;
      // }


      // self.project.attributes.current_stage = curStage;
      $('#navbar_fids').removeClass('hide');
      $('#project_name').removeClass('hide');
      $('#main_menu').addClass('pull-right');
      $('#projectHeader').html(Handlebars.compile($('#projectHeaderTemplate').html())({project: self.project.attributes}));
console.log(self.project.attributes);

      $('#projectHeader').removeClass('hide');
      $('#project_name').html(self.project.attributes.name);
      self.stage = new Data.Models.ContentModel();
      self.stage.url = '/dfcusa-pm/api/content/' + self.sStage;

      self.stage.fetch({success: function() {
        self.showStage();
      }});

      App.setupPage();
    },
    showStage: function() {
      var self = this;


        $('.leftNav').find('li').removeClass('active');
      if (self.sStage == 'home') {


        // $('.leftnav').html(Handlebars.compile($('#roadmapTemplate').html())({project: self.iProjectId}));


        $('.stageicons').find('img').each(function() {
          $(this).attr('src', '/dfcusa-pm/app/webroot/images/icon_' + $(this).attr('data-stage-icon') + '.png');
        });
      } else if (self.sStage == 'files') {


        $('.stageicons').find('img').each(function() {
          $(this).attr('src', '/dfcusa-pm/app/webroot/images/icon_' + $(this).attr('data-stage-icon') + '.png');
        });
      } else {

        $('.stageicons').find('img').each(function() {
          $(this).attr('src', '/dfcusa-pm/app/webroot/images/icon_' + $(this).attr('data-stage-icon') + '.png');
          if ($(this).attr('data-stage-icon') == self.sStage) {
            $(this).attr('src', '/dfcusa-pm/app/webroot/images/icon_' + $(this).attr('data-stage-icon') + '_selected.png');
          }
        });
        // $('.leftnav').html(Handlebars.compile($('#stageLeftNavTemplate').html())({project: self.iProjectId, stage: self.sStage}));
      }

      self.goToSection();

      App.setupPage();
    },
    goToSection: function() {
      var self = this;


      var main = main = $('#main ul');

      // $('.leftnav').addClass('hide');
      //temporary until nav completely removed

      $('.contents').html('');
      navActive();
      $('.insidepage').css('margin-left', 'auto').css('margin-right', 'auto');
      $('.insidepage').css('margin-top', 0).css('margin-bottom', 0);
      $('.insidepage').css('float', 'unset');


      if (self.stage.attributes.fids_stage) {
        var count = 1;
        for (var stageName in self.stage.attributes.content_obj) {
          if(count == 1){
            $.ajax({
            url: '/dfcusa-pm/api/content/'
            // async:false
              })
            .done(function(response){
              var welcomeContent = response[0];
              $('.pan1').last().html(Handlebars.compile($('#welcomeTemplate-partial').html())({welcomeContent: welcomeContent}));
              count +=1;
          });

          }else{
              var panel = ".pan" + count;
              $(panel).html(Handlebars.compile($('#' + stageName + 'Template-partial').html())({content: self.stage.attributes, project: self.project.attributes}));
              count +=1;
          }
        }
        Handlebars.registerPartial("welcome", $("#welcomeTemplate-partial").html());
        Handlebars.registerPartial("getting_started", $("#getting_startedTemplate-partial").html());
        Handlebars.registerPartial("why", $("#whyTemplate-partial").html());
        Handlebars.registerPartial("submit", $("#submitTemplate-partial").html());
        Handlebars.registerPartial("skills", $("#skillsTemplate-partial").html());
        $('.contents').html(Handlebars.compile($('#stageTemplate').html())({content: self.stage.attributes, project: self.project.attributes}));

        function navActive(){
        var windowhasharray = window.location.hash.split("/");
          if (windowhasharray[2] === "feel"){
              $('.navIntro').addClass('active');
              $('.navFeel').addClass('active');
            }else if (windowhasharray[2] === "imagine"){
              $('.navIntro').addClass('active');
              $('.navFeel').addClass('active');
              $('.navImagine').addClass('active');
            }else if (windowhasharray[2] === "do"){
              $('.navIntro').addClass('active');
              $('.navFeel').addClass('active');
              $('.navImagine').addClass('active');
              $('.navDo').addClass('active');
            }else if(windowhasharray[2] === "share"){
              $('.navShare').addClass('active');
              $('.navIntro').addClass('active');
              $('.navFeel').addClass('active');
              $('.navImagine').addClass('active');
              $('.navDo').addClass('active');
            }
            else{
              $('.navShare').removeClass('active');
              $('.navIntro').removeClass('active');
              $('.navFeel').removeClass('active');
              $('.navImagine').removeClass('active');
              $('.navDo').removeClass('active');
            }
        }

        $('.nextSlide').click(function(){

          var slidesArr = $(this).parent().find('.carousel-inner .item');
          if (slidesArr.closest('.active').attr('rel') == '0'){
            $(this).parent().find('.carousel-inner div.active').removeClass('active');
            $(this).parent().find('.carousel-indicators .active').removeClass('active');
            $('.pan2').addClass('active');
            navActive();
          }else if (slidesArr.closest('.active').attr('rel') == '1'){
            $(this).parent().find('.carousel-inner div.active').removeClass('active');
            $(this).parent().find('.carousel-indicators .active').removeClass('active');
            $('.pan3').addClass('active');
            $('.skillsBox .steps li .changeSkill').first().click();
            navActive();
          }else if(slidesArr.closest('.active').attr('rel') == '2'){
            $(this).parent().find('.carousel-inner div.active').removeClass('active');
            $(this).parent().find('.carousel-indicators .active').removeClass('active');
            $('.pan4').addClass('active');
            $('.skillsBox .steps li .changeSkill').first().click();
            navActive();
          }else if (slidesArr.closest('.active').attr('rel') == '3'){
              $(this).parent().find('.carousel-inner div.active').removeClass('active');
              $(this).parent().find('.carousel-indicators .active').removeClass('active');
              $('.pan5').addClass('active');
              $('.carouselNext').text('Complete this stage');
              $('#submitDisplay .steps li .changeDeliverable').first().click();
              navActive();
              debugger;
          }else{
            $(this).parent().find('.carousel-inner div.active').removeClass('active');
            $(this).parent().find('.carousel-indicators .active').removeClass('active');
            $('.pan1').addClass('active');
            $('.skipStep').click();
            navActive();
          }
        });

        $('.prevSlide').click(function(){
          var slidesArr = $(this).parent().find('.carousel-inner .item');
          if (slidesArr.closest('.active').attr('rel') == '4'){
            $(this).parent().find('.carousel-inner div.active').removeClass('active');
            $(this).parent().find('.carousel-indicators .active').removeClass('active');
            $('.pan4').addClass('active');
          }else if (slidesArr.closest('.active').attr('rel') == '3'){
            $(this).parent().find('.carousel-inner div.active').removeClass('active');
            $(this).parent().find('.carousel-indicators .active').removeClass('active');
            $('.pan3').addClass('active');
            $('.skillsBox .steps li .changeSkill').first().click();
          }else if(slidesArr.closest('.active').attr('rel') == '2'){
            $(this).parent().find('.carousel-inner div.active').removeClass('active');
            $(this).parent().find('.carousel-indicators .active').removeClass('active');
            $('.pan2').addClass('active');
          }else if (slidesArr.closest('.active').attr('rel') == '1'){
            $(this).parent().find('.carousel-inner div.active').removeClass('active');
            $(this).parent().find('.carousel-indicators .active').removeClass('active');
            $('.pan1').addClass('active');
          }else{
            $(this).parent().find('.carousel-inner div.active').removeClass('active');
            $(this).parent().find('.carousel-indicators .active').removeClass('active');
            $('.pan5').addClass('active');
            $('#submitDisplay .steps li .changeDeliverable').first().click();
          }
        });

        $('.carouselNext').click(function(){
          $('.nextSlide').click();
        });

        $('.carouselPrev').click(function(){
          $('.prevSlide').click();
        });

        $('.carouselDeliverables').click(function(){
          $(this).parent().find('li').removeClass('active');
          $('.carousel-inner .item.active').first().removeClass('active');
          $('.carouselSubmit').addClass('active');
          $('.carouselNext').text('Complete this stage');
        });



        // $('.nextStepImagine').click(function(){
        $('.skipStep').click(function(){
          var windowhasharray = window.location.hash.split("/");
          if (windowhasharray[2] === "feel"){
            windowhasharray.pop();
            windowhasharray.push("imagine");
            debugger;
            navActive();
          }else if (windowhasharray[2] === "imagine"){
            windowhasharray.pop();
            windowhasharray.push("do");
            navActive();
          }else if (windowhasharray[2] === "do"){
            windowhasharray.pop();
            windowhasharray.push("share");
            navActive();
          }else{
            windowhasharray.pop();
            windowhasharray.push("home");
            windowhasharray.push("files");
            localStorage.setItem('stageComplete', true);
          }
          windowhasharray = windowhasharray.join("/");
          console.log(window.location.host + 'home' + windowhasharray);
          router.navigate((windowhasharray), {replace:true, trigger:true});
          navActive();
        });

       }else if
       (self.sSection == 'files') {
        $('.projecthome li').removeClass('active');
        $(".yourVideo").addClass('active');
        $('.contents').html(Handlebars.compile($('#filesViewTemplate').html()));
        self.showProjectFiles();
      } else {
        $('.contents').html(self.stage.attributes.content_obj.content);
        var windowhasharray = window.location.hash.split("/");
        windowhasharray.push('feel');
        windowhasharray = windowhasharray.join("/");

        var button = ('<a href="'+windowhasharray+'""><button type="button" class="btn btn-success btn-sm skipIntro">Get Started</button></a>');
          $('.contents').append(button);


      }


        $('.changeSkill').click(function(){
          console.log("clicked");
        });

      $('.changeSkill').unbind('click').click(function() {
        $('.step-pane').removeClass('active');
        $('.steps').find('li').removeClass('active');
        $(this).parent().addClass('active');
        $($(this).attr('data-target')).addClass('active');
        //self.currentSkill = $(this).attr('data-skill').toLowerCase();
        $('.activities').html('');
        self.showActivitiesBySkill();
      });

      $('.changeDeliverable').unbind('click').click(function() {
        $('.step-pane').removeClass('active');
        $('.steps').find('li').removeClass('active');
        $(this).parent().addClass('active');
        $($(this).attr('data-target')).addClass('active');

        $('.saveDeliverable').removeClass('hide');
        $('.uploadProjectFile').addClass('hide');
        window.iCurrentDeliverable = $(this).attr('data-deliverable');
        iIndex = -1;
        _.each(self.stage.attributes.content_obj.submit.deliverables, function(deliverable) {
          iIndex = iIndex + 1;
          if (window.iCurrentDeliverable == iIndex) {
            if (deliverable.form == 'textarea') {
              if ((self.project.attributes.details_obj.deliverables != undefined) && (self.project.attributes.details_obj.deliverables[self.sStage] != undefined) && (self.project.attributes.details_obj.deliverables[self.sStage][deliverable.key] != undefined)) {
                $('#projectDeliverables').find('[data-key="' + deliverable.key + '"]').val(self.project.attributes.details_obj.deliverables[self.sStage][deliverable.key]);
              }
            } else if (deliverable.form == 'list') {
              $('.items').html('');
              if ((self.project.attributes.details_obj.deliverables != undefined) && (self.project.attributes.details_obj.deliverables[self.sStage] != undefined) && (self.project.attributes.details_obj.deliverables[self.sStage][deliverable.key] != undefined)) {
                _.each(self.project.attributes.details_obj.deliverables[self.sStage][deliverable.key], function(deliverableValue) {
                  $('.items').append('<div class="listItemContainer"><input type="text" class="listItem form-control withButton" value="' + deliverableValue + '" data-increment="true" data-key="' + deliverable.key + '"/><i class="fa fa-trash-o listItemDelete"></i></div>');
                });
              }
            } else if (deliverable.form == 'upload') {
              $('.saveDeliverable').addClass('hide');
              $('.uploadProjectFile').removeClass('hide');

              window.iProjectId = self.project.attributes.id;

              $('.uploadProjectFile').unbind('click').click(function() {
                $('.uploadFile').click();
                $('.uploadFile').change(function() {
                  $(this).upload('/dfcusa-pm/api/project/' + window.iProjectId + '/file', function(res) {
                    location.href = '/dfcusa-pm/home#project/' + window.iProjectId + '/home/files';
                  }, 'html');
                });
              });
            }
          }
        });

        if (self.project.attributes.mentor.id != window.oCurrentUser.id) {
          $('#projectDeliverables').find('input,textarea,select').attr('disabled', true);
        }

        $('.addListDeliverable').unbind('click').click(function() {
          $('.items').append('<div class="listItemContainer"><input type="text" class="listItem form-control withButton" data-increment="true" data-key="' + $(this).attr('data-key') + '"/><i class="fa fa-trash-o listItemDelete"></i></div>');

          $('.listItemDelete').unbind('click').click(function() {
            $(this).parent().remove();
          });
        });

        $('.listItemDelete').unbind('click').click(function() {
          $(this).parent().remove();
        });

        $('.saveDeliverable').unbind('click').click(function() {
          if (self.project.attributes.details_obj == undefined) self.project.attributes.details_obj = {};
          if (self.project.attributes.details_obj.deliverables == undefined) self.project.attributes.details_obj.deliverables = {};
          if (self.project.attributes.details_obj.deliverables[self.sStage] == undefined) self.project.attributes.details_obj.deliverables[self.sStage] = {};
          iIndex = -1;
          self.project.attributes.details_obj.deliverables[self.sStage] = new Object();
          $('#projectDeliverables').find('input,textarea,select').each(function() {
            if ($(this).attr('id') != '') {
              if ($(this).attr('data-increment') == 'true') {
                if ((self.project.attributes.details_obj.deliverables[self.sStage][$(this).attr('data-key')] == undefined) || (self.project.attributes.details_obj.deliverables[self.sStage][$(this).attr('data-key')] == false)) {
                  self.project.attributes.details_obj.deliverables[self.sStage][$(this).attr('data-key')] = new Array();
                }
                if ($(this).val() != '') {
                  iIndex = iIndex + 1;
                  self.project.attributes.details_obj.deliverables[self.sStage][$(this).attr('data-key')][iIndex] = $(this).val();
                }
              } else {
                if ($(this).val() != '') {
                  self.project.attributes.details_obj.deliverables[self.sStage][$(this).attr('data-key')] = $(this).val();
                }
              }
            }
          });

          self.project.save({}, {success: function(e) {
            app.showNotify('Saved project', 'success');
          }, error: function() {
            app.showNotify('Error saving', 'error');
          }});
        });
      });

      if (self.stage.attributes.content_obj.skills != undefined) {
        self.currentSkill = 'all';
      }

      if (self.sSection == 'home') {

        // changed the == from "skill" to "home" to coerce skills to show
        // console.log(self.sSection);
        self.showActivitiesBySkill();
      }

      if (self.sSection == 'submit') {
        $('.changeDeliverable:first').click();
      }

      $('.searchActivities').unbind('click').click(function() {
        self.searchActivities();
      });

      $('#content').append(Handlebars.compile($('#projectFilesTemplate').html())({project: self.project.attributes}));

      self.skills = App.HomeRouter.models.skills;
      self.skills.fetch({success: function() {
        _.each(self.skills.models, function(skill) {
          $('.skillsList').append('<option value="' + skill.attributes.skill + '">' + app.ucwords(skill.attributes.skill) + '</option>');
        });
      }});

      window.sStage = self.stage.attributes.stage;

      $('.uploadFiles').removeClass('hide');
    },
    showProjectFiles: function() {
      var self = this;
      bFound = false;
      _.each(self.project.attributes.files_obj, function(file) {
        bFound = true;
        $('.filesList').append(Handlebars.compile($('#fileTabletTemplate').html())({file: file, filename: file.substring(file.lastIndexOf('/')+1)}));
      });

      if (!bFound) $('.noFiles').removeClass('hide');

      window.iProjectId = self.project.attributes.id;
      $('.uploadProjectFile').unbind('click').click(function() {
        $('.uploadFile').click();
        $('.uploadFile').change(function() {
          $(this).upload('/dfcusa-pm/api/project/' + window.iProjectId + '/file', function(res) {
            location.reload();
          }, 'html');
        });
      });

      $('.deleteFile').unbind('click').click(function() {
        $(this).parent().parent().remove();

        self.project.attributes.files_obj = new Array();
        $('#filesList').find('li').each(function() {
          self.project.attributes.files_obj.push($(this).attr('data-file'));
        });

        self.project.save({}, {success: function(e) {
          app.showNotify('Saved project', 'success');
        }, error: function() {
          app.showNotify('Error saving', 'error');
        }});
      });
    },
    showActivitiesBySkill: function() {
      var self = this;

      bFound = false;
      if (self.currentSkill != 'all') {
        $('.activities').html('<h4>' + app.ucwords(self.currentSkill) + ' Activities</h4>');
      } else {
        $('.activities').html('<h4>All ' + app.ucwords(self.sStage) + ' Activities</h4>')
      }
      self.activities = new Data.Collections.Activities;
      self.activities.url = '/dfcusa-pm/api/activities/stage/' + self.sStage + '/100/' + self.iProjectId;
      self.activities.fetch({success: function() {

        var count = 0;
         // var windowhash = window.location.hash.split('/');
      var curStage =  window.location.hash.split('/');
      curStage = curStage[2];
      if(typeof curStage == "undefined"){curStage = 'feel';}
      String.prototype.capitalize = function() {
        return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
      };

      curStage = curStage.capitalize();

        _.each(self.activities.models, function(activity) {
          // debugger;
          if (count < 3){
            if ((activity.attributes.all_skills.indexOf(self.currentSkill) > -1) || (self.currentSkill == 'all')) {
              var actSkill = activity.attributes.all_skills[0].capitalize();
              $('.activities').append(Handlebars.compile($('#activityTemplate').html())({activity: activity.attributes, curStage: curStage, actSkill: actSkill}));
              bFound = true;
              count = count + 1;
              // debugger;
            }
          }
        });

        $('.viewMore').unbind('click').click(function(e){
          e.preventDefault();
          var selfSkill = this.value;
          $('.contents').html('');
          $('.insidepage').addClass('activity');
          $('.activity').append("<div class='activitiesContent'></div>");
          // $('.leftnav').addClass('hide');
          // debugger;
          // $('.leftnav').html(Handlebars.compile($('#roadmapTemplate').html())({project: self.iProjectId}));
          // $('.leftnav').removeClass('hide');
          window.location.hash = "#activityskill";
          $.ajax({
            url: "/api/activities/skill/" + selfSkill,
          }).done(function(res){
            for (var i = 0; i < res.length; i++) {
              $('.activitiesContent').append(Handlebars.compile($('#activityTemplate').html())({activity: res[i], selfSkill: selfSkill}));
            }
            $('.viewMore').addClass('hide');
          });
        });

        $('.activities').append(Handlebars.compile($('#moreActivityTemplate').html()));

        if (bFound == false) {
          $('.activities').append('<br/><div class="alert alert-info">No activities found.</div>');
        }
        $('.uploadProjectFile').on("click", function() {
          console.log(window.sStage);
          var activity_id = this.value;
          $('.uploadFile').click();
          var hash = window.location.hash.split("");
          var hashid = hash[9] + hash[10];
          $('.uploadFile').change(function() {
          $(this).upload('/dfcusa-pm/api/project/' + hashid + '/file/' + activity_id + '/' + window.sStage, function(res) {
            location.reload();
            }, 'html');
          });
        });
      }});
    },
    searchActivities: function() {
      var self = this;

      bFound = false;
      $('.activities').html('<h4>Found Activities</h4>');
      self.activities = new Data.Collections.Activities;
      self.activities.url = '/dfcusa-pm/api/activities/stage/' + self.sStage + '/' + self.iProjectId;
      self.activities.fetch({success: function() {
        _.each(self.activities.models, function(activity) {
          if ((activity.attributes.all_skills.indexOf($('#search-skill').val()) > -1) || ($('#search-skill').val() == 'all')) {
            if ((activity.attributes.time_required == $('#search-time_required').val()) || ($('#search-time_required').val() == 'all')) {
              if ((activity.attributes.age_group == $('#search-age_group').val())) {
                $('.activities').append(Handlebars.compile($('#activityTemplate').html())({activity: activity.attributes}));
                bFound = true;
              }
            }
          }
        });
        if (bFound == false) {
          $('.activities').append('<br/><div class="alert alert-info">No activities found.</div>');
        }
      }});
    }

  });

  Home.ActivitiesView = Backbone.View.extend({
    sSkill: 'all',
    sAge: 'all_ages',
    sTime: 'all_times',
    initialize: function () {
      var self = this;
      self.getProjects();
    },
    unload: function() {
      this.remove();
      this.unbind();
    },
    afterRender: function () {
      var self = this;

      $('.inner_nav').find('a').removeClass('active');
      $('.leftnav').addClass('hide');
      $('#projectHeader').addClass('hide');
      $('.allactivities').addClass('active');
      $('#navbar_fids').addClass('hide');
      $('#main_menu').removeClass('pull-right');
      $('#project_name').addClass('hide');
      App.setupPage();
    },
    getProjects: function() {
      var self = this;
      self.user = App.HomeRouter.models.user;
      self.user.fetch({success: function() {
        self.showActivities();
      }});
    },
    showActivities: function() {
      var self = this;

      $('#content').html(Handlebars.compile($('#activitiesListTemplate').html()));
      $('.staging').html(Handlebars.compile($('#activitiesTemplate').html()));
      $('.searchToolbar').html($('.staging').find('#toolbar').html());
      $('.staging').html('');
      $('#content').find('table').css('float', 'right');

      self.skills = App.HomeRouter.models.skills;
      self.skills.fetch({success: function() {
        _.each(self.skills.models, function(skill) {
          $('.skillsList').append('<option value="' + skill.attributes.skill + '">' + app.ucwords(skill.attributes.skill) + '</option>');
        });

        //if ((self.sSkill) && (self.sAge) && (self.sTime)) {
          self.searchActivities();
        //}
      }});

      $('.searchActivities').unbind('click').click(function() {
        window.location.href = '#activities/' + $('#search-skill').val() + '/' + $('#search-age_group').val() + '/' + $('#search-time_required').val();
      });
    },
    searchActivities: function() {
      var self = this;

      bFound = false;
      $('.activitiesContent').html('');
      self.activities = new Data.Collections.Activities;
      self.activities.url = '/dfcusa-pm/api/activities';
      self.activities.fetch({success: function() {
        _.each(self.activities.models, function(activity) {
          if ((activity.attributes.all_skills.indexOf(self.sSkill) > -1) || (self.sSkill == 'all') || (self.sSkill == undefined)) {
            if ((activity.attributes.time_required == self.sTime) || (self.sTime == 'all_times') || (self.sTime == undefined)) {
              if ((activity.attributes.age_group == self.sAge) || (self.sAge == undefined)) {
                $('.activitiesContent').append(Handlebars.compile($('#activityTemplate').html())({activity: activity.attributes}));
                bFound = true;
              }
            }
          }
        });
        if (bFound == false) {
          $('.activitiesContent').append('<br/><div class="alert alert-danger">No activities found.</div>');
        }
      }});

      $('#search-skill').val(self.sSkill);
      $('#search-age_group').val(self.sAge);
      $('#search-time_required').val(self.sTime);
    }
  });

  Home.MentorsView = Backbone.View.extend({
      initialize: function () {
        var self = this;
      },
      unload: function() {
        this.remove();
        this.unbind();
      },
      afterRender: function() {
        var self = this;

        App.setupPage();

        self.getMentors();
      },
      getMentors: function() {
        var self = this;

        $('.inner_navigation a').removeClass('active');
        $('.editorg').addClass('active');

        self.oOrganization = new Data.Models.OrganizationModel();
        self.oOrganization.fetch({success: function() {
          $('#content').html('');
          $('#content').append(Handlebars.compile($('#editOrgTemplate').html())({org: self.oOrganization.attributes, masterMentor: oCurrentUser.master_mentor}));

          $('.gHome').unbind('click').click(function(){
            window.history.back();
          });

          $('.inviteMentor').unbind('click').click(function() {
            self.inviteMentor();
          });

          $('.deleteMentorConf').unbind('click').click(function(){
            var delId = this.value;
            var deleteLine = this;
            $('.deleteMentor').attr('value', delId);
            $('#deleteMentorModal').modal('show');
          });

          $('.deleteMentor').unbind('click').click(function(){
            var selfButton = this;
            var delMentorId = this.value;
            _.each(self.oOrganization.attributes.users, function(user) {
              if (user.id == delMentorId) {
                oDelUser = new Data.Models.UserModel();
                oDelUser.attributes.id = user.id;
                oDelUser.url = '/dfcusa-pm/api/user/' + oDelUser.attributes.id;
                oDelUser.destroy({success: function(res) {
                  debugger;
                  $('#deleteMentorModal').modal('hide');
                  $("[value="+delMentorId+"]+")[0].closest('tr').remove();
                }});
              }
            });
          });

          $('.editMentor').unbind('click').click(function(e){
            self.editMentor($(this).attr('value'));
          });

          $('.delProjectModal').unbind('click').click(function(e){
            var userId = this.closest('tr');
            var projId = this;
            $('#deleteProjectModal').modal('show');
            self.deleteProject(userId, projId);
          });

        }});
      },

      deleteProject:function(userId, projId){
        $('.delProject').unbind('click').click(function(e){
          var userIdButton = userId;
          userId = userId.attributes.value.value;
          var projRow = projId;
          projId = projId.attributes.value.value;

          $.ajax({
              url: '/dfcusa-pm/api/project/' + projId + '/user/' + userId,
              // /api/project/:projectid
              //alternate project delete
              type: 'DELETE'
            }).done(function(){
              projRow.closest('td').remove();
            });
          $.ajax({
            url: '/dfcusa-pm/api/project/' + projId,
            // /api/project/:projectid
            // had to delete on both routes to properly remove
            type: 'DELETE'
          }).done(function(){
            console.log('lo');
            $('#deleteProjectModal').modal('hide');
          });
        });
      },
      editMentor: function(userId) {
        var self = this;

        _.each(self.oOrganization.attributes.users, function(user) {
          if (user.id == userId) {
            $("#editMentorModal").modal('show');
            $('#editMentorModal').find('#first_name').val(user.first_name);
            $('#editMentorModal').find('#last_name').val(user.last_name);
            $('#editMentorModal').find('#email').val(user.email);
            $('#editMentorModal').find('#location').val(user.location);
            $('#editMentorModal').find('.profilePic').attr('src', user.profilepic);
            $('#editMentorModal').find('#profile_pic_source').val(user.profilepic);
            $('.saveMentor').attr('value', user.id);
            $('.saveMentor').unbind('click').click(function(e) {
              self.saveMentor($(this).attr('value'));
            });
          }
        });
      },
      saveMentor: function(userId) {
        var self = this;

        oSaveMentor = new Data.Models.UserModel();
        oSaveMentor.attributes.id = userId;
        oSaveMentor.url = '/dfcusa-pm/api/user/' + oSaveMentor.attributes.id;
        oSaveMentor.attributes.first_name = $('#editMentorModal').find('#first_name').val();
        oSaveMentor.attributes.last_name = $('#editMentorModal').find('#last_name').val();
        oSaveMentor.attributes.email = $('#editMentorModal').find('#email').val();
        oSaveMentor.attributes.location = $('#editMentorModal').find('#location').val();

        oSaveMentor.save({}, {success: function() {
          $("#editMentorModal").modal('hide');

          self.getMentors();
        }});
      },
      inviteMentor: function() {
        var self = this;

        $('#inviteModal').modal('show');

        $('.sendInvite').unbind().click(function() {
          $.get('/dfcusa-pm/api/organization/invite/' +  $('.inviteName').val() + '/' + $('.inviteEmail').val());
          $('#inviteModal').modal('hide');
        });
      }
    });

  Home.ActivityskillView = Backbone.View.extend({
      initialize: function () {
        var self = this;
      },
      unload: function() {
        this.remove();
        this.unbind();
      },
      afterRender: function() {
        var self = this;

        App.setupPage();
      }
    });

  Home.WelcomeView = Backbone.View.extend({
      initialize: function () {
        var self = this;
      },
      unload: function() {
        this.remove();
        this.unbind();
      },
      afterRender: function() {
        var self = this;

        App.setupPage();

        self.carouselSetup();
      },
      carouselSetup: function() {
        var self = this;
        $('#content').html('');
        $.ajax({
              url: '/dfcusa-pm/api/content/'
            }).done(function(content){
              console.log(content);
              $('#content').html(Handlebars.compile($('#onboardingTemplate').html())({content: content}));
              $('.carousel-indicators li').first().addClass('active');
              $('.carousel-inner .item').first().addClass('active');
            });
    }
  });


  return Home;
});
