(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{"3WkJ":function(s,a,e){(s.exports=e("I1BE")(!1)).push([s.i,"[dir] .login-tabs-container {\n  padding: 6rem 8rem 4rem 8rem;\n}\n[dir] .login-tabs-container .input-icon-validate {\n  background: none;\n}\n[dir=ltr] .login-tabs-container .input-icon-validate {\n  right: 6px;\n}\n[dir=rtl] .login-tabs-container .input-icon-validate {\n  left: 6px;\n}\n[dir] .login-tabs-container .mb-base {\n  margin-top: 2.2rem;\n}\n.login-tabs-container .custom-placeholder {\n  font-size: 0.8rem;\n  position: relative;\n  top: -5px;\n}\n.login-tabs-container .password-show {\n  position: absolute;\n  top: 30px;\n  z-index: 1;\n}\n[dir=ltr] .login-tabs-container .password-show {\n  right: 10px;\n}\n[dir=rtl] .login-tabs-container .password-show {\n  left: 10px;\n}\n@media only screen and (max-width: 1200px) {\n[dir] .login-tabs-container {\n    padding: 5rem 4rem 2rem 4rem;\n}\n[dir] .login-tabs-container .input-icon-validate {\n    background: none;\n}\n[dir=ltr] .login-tabs-container .input-icon-validate {\n    right: 6px;\n}\n[dir=rtl] .login-tabs-container .input-icon-validate {\n    left: 6px;\n}\n[dir] .login-tabs-container .mb-base {\n    margin-top: 2.2rem;\n}\n.login-tabs-container .custom-placeholder {\n    font-size: 0.8rem;\n    position: relative;\n    top: -5px;\n}\n.login-tabs-container .password-show {\n    position: absolute;\n    top: 30px;\n    z-index: 1;\n}\n[dir=ltr] .login-tabs-container .password-show {\n    right: 10px;\n}\n[dir=rtl] .login-tabs-container .password-show {\n    left: 10px;\n}\n}",""])},"4NEi":function(s,a,e){var t=e("3WkJ");"string"==typeof t&&(t=[[s.i,t,""]]);var n={hmr:!0,transform:void 0,insertInto:void 0};e("aET+")(t,n);t.locals&&(s.exports=t.locals)},"6qNA":function(s,a,e){"use strict";var t=e("4NEi");e.n(t).a},AA9e:function(s,a,e){"use strict";e.r(a);var t={data:function(){return{name:"",email:"",business_name:"",password:"",confirm_password:"",error:"",pass_show:!1,pass_show_confirm:!1}},methods:{submitForm:function(){var s=this;this.$validator.validateAll().then((function(a){if(a){if(s.password!=s.confirm_password)return s.error="Confirm password was not matched",!1;s.$http.post("/api/register",{name:s.name,email:s.email,business_name:s.business_name,password:s.password}).then((function(a){a.data.status?(s.$store.commit("auth/SET_LOGIN",!0),s.$router.push("/")):(s.$store.commit("auth/SET_LOGIN",!1),s.error=a.data.error)})).catch((function(a){s.$store.commit("auth/SET_LOGIN",!1),s.error=a}))}}))}}},n=(e("6qNA"),e("KHd+")),i=Object(n.a)(t,(function(){var s=this,a=s.$createElement,t=s._self._c||a;return t("div",{staticClass:"h-screen flex w-full vx-row no-gutter items-center justify-center full-page-bg-color",attrs:{id:"page-login"}},[t("div",{staticClass:"vx-col sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-3/7 sm:m-0 m-4"},[t("vx-card",[t("div",{staticClass:"main-bg-color",attrs:{slot:"no-body"},slot:"no-body"},[t("div",{staticClass:"vx-row no-gutter justify-center"},[t("div",{staticClass:"vx-col sm:w-full md:w-full lg:w-1/1 d-theme-dark-bg"},[t("div",{staticClass:"login-tabs-container"},[t("div",{staticClass:"vx-card__title mb-4 text-center"},[t("img",{staticClass:"centered",staticStyle:{height:"2rem"},attrs:{src:e("Z8mA"),alt:"logo"}}),s._v(" "),t("p",{staticStyle:{"font-size":"16px","font-weight":"lighter","margin-bottom":"3rem","margin-top":".5rem"}},[s._v("Comece agora mesmo")])]),s._v(" "),t("form",[t("div",{staticClass:"mb-6"},[t("span",{staticClass:"custom-placeholder"},[s._v("Nome")]),s._v(" "),t("vs-input",{directives:[{name:"validate",rawName:"v-validate",value:"required",expression:"'required'"}],staticClass:"w-full",attrs:{type:"text",name:"name",danger:s.errors.has("name"),placeholder:"Input your name","val-icon-success":"done","val-icon-danger":"clear"},model:{value:s.name,callback:function(a){s.name=a},expression:"name"}}),s._v(" "),t("span",{staticClass:"text-danger text-sm"},[s._v(s._s(s.errors.first("name")))])],1),s._v(" "),t("div",{staticClass:"mb-6"},[t("span",{staticClass:"custom-placeholder"},[s._v("Email")]),s._v(" "),t("vs-input",{directives:[{name:"validate",rawName:"v-validate",value:"required|email",expression:"'required|email'"}],staticClass:"w-full",attrs:{type:"email",name:"email",success:!s.errors.has("email"),danger:s.errors.has("email"),placeholder:"Input your email","val-icon-success":"done","val-icon-danger":"clear"},model:{value:s.email,callback:function(a){s.email=a},expression:"email"}}),s._v(" "),t("span",{staticClass:"text-danger text-sm"},[s._v(s._s(s.errors.first("email")))])],1),s._v(" "),t("div",{staticClass:"mb-6"},[t("span",{staticClass:"custom-placeholder"},[s._v("Nome de Empresa")]),s._v(" "),t("vs-input",{directives:[{name:"validate",rawName:"v-validate",value:"required",expression:"'required'"}],staticClass:"w-full",attrs:{type:"text",name:"business_name",danger:s.errors.has("business_name"),placeholder:"Input your business name","val-icon-success":"done","val-icon-danger":"clear"},model:{value:s.business_name,callback:function(a){s.business_name=a},expression:"business_name"}}),s._v(" "),t("span",{staticClass:"text-danger text-sm"},[s._v(s._s(s.errors.first("business_name")))])],1),s._v(" "),t("div",{staticClass:"position-relative mb-6"},[t("div",{staticClass:"password-show",on:{click:function(a){s.pass_show=!s.pass_show}}},[t("i",{class:s.pass_show?"vs-icon feather icon-eye-off":"vs-icon feather icon-eye"})]),s._v(" "),t("span",{staticClass:"custom-placeholder"},[s._v("Criar Senha")]),s._v(" "),t("vs-input",{directives:[{name:"validate",rawName:"v-validate",value:"required",expression:"'required'"}],staticClass:"w-full mt-0",attrs:{type:s.pass_show?"text":"password",name:"password",placeholder:"Input your password",danger:s.errors.has("password")},model:{value:s.password,callback:function(a){s.password=a},expression:"password"}}),s._v(" "),t("span",{staticClass:"text-danger text-sm"},[s._v(s._s(s.errors.first("password")))])],1),s._v(" "),t("div",{staticClass:"position-relative mb-4"},[t("div",{staticClass:"password-show",on:{click:function(a){s.pass_show_confirm=!s.pass_show_confirm}}},[t("i",{class:s.pass_show?"vs-icon feather icon-eye-off":"vs-icon feather icon-eye"})]),s._v(" "),t("span",{staticClass:"custom-placeholder"},[s._v("Confirmar Senha")]),s._v(" "),t("vs-input",{directives:[{name:"validate",rawName:"v-validate",value:"required",expression:"'required'"}],staticClass:"w-full mt-0",attrs:{type:s.pass_show_confirm?"text":"password",name:"confirm_password",placeholder:"Input your confirm password",danger:s.errors.has("confirm_password")},model:{value:s.confirm_password,callback:function(a){s.confirm_password=a},expression:"confirm_password"}}),s._v(" "),t("span",{staticClass:"text-danger text-sm"},[s._v(s._s(s.errors.first("confirm_password")))])],1),s._v(" "),t("div",{staticClass:"mb-6"},[t("span",{staticClass:"text-danger"},[s._v(s._s(s.error))])]),s._v(" "),t("div",{staticClass:"flex flex-wrap justify-between my-5"},[t("vs-button",{staticClass:"custom-filled-button btn-block",attrs:{color:"white",type:"filed"},on:{click:s.submitForm}},[s._v("Criar Conta")])],1),s._v(" "),t("div",{staticClass:"text-center"},[t("span",{staticStyle:{"font-weight":"lighter"}},[s._v("Já possui uma conta?")]),s._v(" "),t("router-link",{staticClass:"main-color vertical-centered",staticStyle:{"font-size":"0.9rem"},attrs:{to:"login"}},[s._v("Faça Login")])],1)])])])])])])],1)])}),[],!1,null,null,null);a.default=i.exports},Z8mA:function(s,a){s.exports="/images/logo.png?80d8adff9ba7543d938051af067cb66c"}}]);