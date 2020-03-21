define({ "api": [
  {
    "type": "post",
    "url": "/user/login",
    "title": "用户登录接口",
    "name": "用户登录",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>用户工号/学号.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "pwd",
            "description": "<p>用户密码.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>用户类型 student-学生 teacher-教师.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "info",
            "description": "<p>{&quot;err&quot;:0,&quot;msg&quot;:data}</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/UserRouter.js",
    "groupTitle": "User"
  }
] });
