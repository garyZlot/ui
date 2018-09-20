import { get, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import $ from 'jquery'

export default Controller.extend({
  settings:    service(),
  globalStore: service(),
  access:      service(),

  registerSucc: false,
  saving:       false,
  saveDisabled: true,

  actions:      {
    getEmailCode() {
      var countdown = 60;
      var emailStr = this.get('model').email;

      if (!is_email(emailStr)) {
        alert('请输入合法的电子邮箱');

        return;
      }

      let promise;

      promise = get(this, 'globalStore').request({
        url:    '/v3-public/localProviders/local?action=confirm',
        method: 'POST',
        data:   { email: emailStr }
      });

      return promise.then(() => {
        settime();
        alert('验证码已发送');
      }).catch((err) => {
        console.log(err);
      });


      function settime() {
        if (countdown === 0) {
          $('#getCodeBtn').attr('disabled', false);
          $('#getCodeBtn').text('获取验证码');
        } else {
          $('#getCodeBtn').attr('disabled', true);
          $('#getCodeBtn').text(`重新发送( ${ countdown } )`);
          countdown--;
          setTimeout(settime, 1000)
        }
      }

      function is_email(email) {
        if ( email === '') {
          return false;
        } else {
          if (!/^[\w\-\.]+@[\w\-\.]+(\.\w+)+$/.test(email)) {
            return false;
          }
        }

        return true;
      }
    },


    register() {
      this.set('saving', true);

      let promise;

      promise = get(this, 'globalStore').request({
        url:    '/v3-public/localProviders/local?action=signup',
        method: 'POST',
        data:   this.get('model')
      });

      return promise.then(() => {
        this.set('saving', false);
        this.set('registerSucc', true);
      }).catch((err) => {
        if (err.status === 409) {
          this.set('showReset', true);
        }
        this.set('saving', false);
        this.set('errors', [err.message]);
      });
    },

    cancel() {
      if (this.get('errors')) {
        this.set('errors', []);
      }
      this.transitionToRoute('login');
    }
  },

  validate: observer('model.email', 'model.code', 'model.password', function() {
    if (this.get('model.email') && this.get('model.code') && this.get('model.password')) {
      if (this.get('errors')) {
        this.set('errors', []);
      }
      this.set('saveDisabled', false);
    } else {
      this.set('saveDisabled', true);
    }
  }),
});
