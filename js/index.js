$(function(){
    // 测试 di
    // var medicine_url = "http://192.168.0.155:8006/stmedicine";// 测试个人信息
    // var assistant_url = "http://192.168.0.155:8036/stassistant";// 测试预约
    // var weixin_url = "http://192.168.0.155:8046/stweixin";// 测试微信
    //线上  
    // var medicine_url = "http://www.shentingkeji.com/stmedicine";//个人信息
    // var assistant_url = "http://www.shentingkeji.com/stassistant";//预约
    // var weixin_url = "http://www.shentingkeji.com/stweixin";//微信
    
    // 测试 tao
    var medicine_url = "http://192.168.0.2:8006/stmedicine";// 测试个人信息
    var assistant_url = "http://192.168.0.2:8036/stassistant";// 测试预约
    var weixin_url = "http://192.168.0.2:8046/stweixin";// 测试微信
    // 公共方法401跳转
    function to_login(data){
        if (data !== undefined && data.code !== undefined){
            if (data.code == 401) {
                window.location.href='./login.html';
            }
        }
    }
    // 公共方法，返回上一级
    $('.header').on('click','span',function(){
        window.history.go(-1);
    });
    // 公共方法：分页

    if($('.lead').size()>0){//导航页面
        $('.lead_button').on('click',function(){
            wx.openLocation({
                latitude: 30.5547, // 纬度，浮点数，范围为90 ~ -90
                longitude: 104.079, // 经度，浮点数，范围为180 ~ -180。
                name: '神庭诊所', // 位置名
                address: '四川省成都市武侯区世纪城路198号206-1-15号', // 地址详情说明
                scale: 20, // 地图缩放级别,整形值,范围从1~28。默认为最大
                // infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
            });
        });
    }else if($('.login').size()>0){  //如果是登录页面
        function comm(){//相同代码，公用
            var name = $('.name').val();
            var password = $('.password').val();
            if(name.length>0 && password.length>0){
                $('.login .login_btn').addClass('pass');
            }else{
                $('.login .login_btn').removeClass('pass');
            }
        };
        comm();
        $('.input_row input').on('keyup',function(){
            comm();
        });
        $('button.login_btn').click(function(){//点击登录
            var name = $('.name').val();
            var password = $('.password').val();
            if(name.length>0 && password.length>0){
                $.ajax({
                    type: "POST",
                    url: weixin_url + '/oauth-login-processor',
                    data: {username:name,password:password},//只有此处传这样的数据结构
                    dataType: "json",
                    success: function(data){
                        if(data.code==0){
                            localStorage.setItem("access_token", data.token.access_token);
                            var _url = document.referrer;
                            var _index = _url.lastIndexOf("\/");  
                            var str  = _url.substring(_index + 1, _url.length);
                            if (str == 'doctor-list.html'){//医生列表跳转而来
                                window.location.href='./doctor-list.html';
                            }else if (str == 'application.html'){//神庭公益跳转而来
                                window.location.href='application.html';
                            }else{
                                window.location.href='./person.html';
                            } 
                        }else{
                            var $androidDialog2 = $('#androidDialog2');
                            $androidDialog2.fadeIn(200);
                        }
                    }
                });
            }
            $('.login  .weui-dialog__btn_primary').on('click',function(){
                var $androidDialog2 = $('#androidDialog2');
                $androidDialog2.fadeOut(200);
            });
       });
    }else if($('.m_regist').size()>0){  //如果是注册页面
        var set_time;
        // 头部菜单切换
        $('.bar_option').on('click','.flex-1',function(){
            clearTimeout(set_time);
            $('.get_code .remain_time').html('60');//初始化
            if($(this).hasClass('active')){
                $(this).siblings().removeClass('active');
            }else{
                $(this).addClass('active').siblings().removeClass('active');
                $('.weui-loadmore').removeClass('dis-no');
                $('.has_noinfo').addClass('dis-no');
            }
            if($(this).hasClass('re_phone')){//如果是手机注册
                if($('.phone_input').hasClass('dis-no')){
                    $('.phone_input').removeClass('dis-no');
                    $('.email_input').addClass('dis-no');
                    $('.phone_input').val('');
                }else{
                    return;
                }
            }else if($(this).hasClass('re_email')){//如果是邮箱注册
                if($('.email_input').hasClass('dis-no')){
                    $('.email_input').removeClass('dis-no');
                    $('.phone_input').addClass('dis-no');
                    $('.email_input').val('');
                }else{
                    return;
                }
            }
            $('button.get_code_btn.hasinput').removeClass('dis-no');  
            $('button.get_code_btn.hasinput').removeClass('hasinput');
            $('.get_code').addClass('dis-no');
        });
        // 单选确认
        $('.regist .weui-agree').on('click',function(){
            var is_agree = $(this).children('.weui-agree__checkbox').prop('checked');
            if (is_agree) {
                $('.login_btn').addClass('pass');
            }else{
                $('.login_btn').removeClass('pass');
            }
        });
        // 输入手机号，获取验证码变化
        $('.regist .input_row input.re_input').on('keyup',function(){
            var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;//邮箱格式验证
            var reg2 = /^[1][3,4,5,7,8][0-9]{9}$/;//手机号码正则
            var _val = $('.email_input').val();
            var _val2 = $('.phone_input').val();
            var obj = reg.test(_val);
            var obj2 = reg2.test(_val2);
            if(obj2 == true && $(this).hasClass('phone_input')){//手机注册
                $('.get_code_btn').addClass('hasinput');
            }else if(obj == true && $(this).hasClass('email_input')){
                $('.get_code_btn').addClass('hasinput');
            }else{
                $('.get_code_btn').removeClass('hasinput');
            }
        });
        $('button.get_code_btn.hasinput').live('click',function(){//此处用live因为class为后面动态生成，所以on('click')无效
            if ($('.re_phone').hasClass('active')) {//手机注册
                var _val2 = $('.phone_input').val();
                $.ajax({//手机注册请求
                    type: "GET",
                    url: medicine_url +'/v1.0.0/signup/p/'+_val2,
                    dataType: "json",
                    success: function(data){
                        if(data.code==0){
                            $.ajax({//手机注册请求
                                type: "GET",
                                url: medicine_url +'/v1.0.0/signup/getSmsCode/'+_val2,
                                dataType: "json",
                                success: function(data2){
                                    if (data2.code !== 0) {
                                        $('.weui-dialog .weui-dialog__bd').html(data2.message);
                                        var $androidDialog2 = $('#Dialog2');
                                        $androidDialog2.fadeIn(200);
                                    }else{
                                        clearTimeout(set_time);
                                        $('.get_code .remain_time').html('60');//初始化
                                        $('.get_code_btn').addClass('dis-no'); 
                                        $('.get_code').removeClass('dis-no'); 
                                        var _Time = 60;
                                        function _time(){
                                            if (_Time>0){
                                                set_time = setTimeout(function(){
                                                    _Time--;
                                                    var remain_time = _Time;
                                                    $('.get_code .remain_time').html(remain_time);
                                                    _time();
                                                },1000);
                                            }else{
                                                $('button.get_code_btn.hasinput').removeClass('dis-no');  
                                                $('.get_code').addClass('dis-no');
                                            }
                                        }
                                        _time();
                                    }
                                }
                            });
                        }else{
                            $('.weui-dialog .weui-dialog__bd').html(data.message);
                            var $androidDialog2 = $('#Dialog2');
                            $androidDialog2.fadeIn(200);
                        }
                    }
                });
            }else if($('.re_email').hasClass('active')){//邮箱登录
                var _val = $('.email_input').val();
                $.ajax({//邮箱注册请求
                    type: "GET",
                    url: medicine_url +'/v1.0.0/sign-up/get-validate-code/email/'+_val,
                    dataType: "json",
                    success: function(data){
                        if(data.code !== 0){//事件处理
                            $('.weui-dialog .weui-dialog__bd').html(data.message);
                            var $androidDialog2 = $('#Dialog2');
                            $androidDialog2.fadeIn(200);
                        }else{
                            clearTimeout(set_time);
                            $('.get_code .remain_time').html('60');//初始化
                            $('.get_code_btn').addClass('dis-no'); 
                            $('.get_code').removeClass('dis-no'); 
                            var _Time = 60;
                        
                            function _time(){
                                if (_Time>0){
                                    set_time = setTimeout(function(){
                                        _Time--;
                                        var remain_time = _Time;
                                        $('.get_code .remain_time').html(remain_time);
                                        _time();
                                    },1000);
                                }else{
                                    $('button.get_code_btn.hasinput').removeClass('dis-no');  
                                    $('.get_code').addClass('dis-no');
                                }
                            }
                            _time();
                        }
                    }
                }); 
            }
        });
        // 隐藏弹窗
        $('.regist .weui-dialog__btn_primary').live('click',function(){//vue重新渲染页面，所以用live
            var $androidDialog2 = $('#Dialog2');
            $androidDialog2.fadeOut(200);
        });
        // 单选确认
        $('.regist .pass').live('click',function(){
            var password =  $('.pass_name').val();
            var invitedNum = $('.invitedNum').val();//邀请码
            // if (invitedNum.length == 0) {//未输入验证码
            //     $('.weui-dialog .weui-dialog__bd').html('请输入邀请码！'); 
            //     var $androidDialog2 = $('#Dialog2');
            //     $androidDialog2.fadeIn(200);
            // }else if(invitedNum.length !== 0 ){
                var invitedNum = invitedNum;
                var once_pass = $('.once_pass').val();
                var twice_pass = $('.twice_pass').val();
                if (once_pass == twice_pass && 6 <= once_pass.length && 6 <= twice_pass.length){//两次密码一致
                    var pass_code = $('.pass_code').val();
                    if ($('.re_phone').hasClass('active')) {
                        var re_input = $('.phone_input').val();
                    }else{
                        var re_input = $('.email_input').val();
                    }
                    if(re_input.length>0 && pass_code.length>0){//判断手机和验证码是否输入完成
                        if ($('.re_phone').hasClass('active')) {//手机注册
                            var phone = $('.phone_input').val();
                            var smsCode = $('.pass_code').val();//手机验证码
                            $.ajax({//手机注册
                                type: "POST",
                                url: medicine_url +'/v1.0.0/signup',
                                contentType:"application/json",
                                data: JSON.stringify({phone:phone,password:password,smsCode:smsCode,invitedNum:invitedNum}),
                                dataType: "json",
                                success: function(data){
                                    if(data.code !== 0){//事件处理
                                        $('.weui-dialog .weui-dialog__bd').html(data.message);
                                        var $androidDialog2 = $('#Dialog2');
                                        $androidDialog2.fadeIn(200);
                                    }else{
                                        $('#regist_info').css('display','block');
                                        setTimeout(function(){
                                            $('#regist_info').css('display','none');
                                            window.location.href='./login.html';
                                        },2000);
                                    }
                                }
                            });
                        }else if($('.re_email').hasClass('active')){//邮箱注册
                            var email =  $('.email_input').val();
                            var code = $('.pass_code').val();//邮箱验证码
                            $.ajax({//邮箱注册
                                type: "POST",
                                url: medicine_url +'/v1.0.0/sign-up/email',
                                contentType:"application/json",
                                data: JSON.stringify({email:email,password:password,code:code,invitedNum:invitedNum}),//只有此处传这样的数据结构
                                dataType: "json",
                                success: function(data2){
                                    if(data2.code !== 0){//事件处理
                                        $('.weui-dialog .weui-dialog__bd').html(data2.message);
                                        var $androidDialog2 = $('#Dialog2');
                                        $androidDialog2.fadeIn(200);
                                    }else{
                                        $('#regist_info').css('display','block');
                                        setTimeout(function(){
                                            $('#regist_info').css('display','none');
                                            window.location.href='./login.html';
                                        },2000);
                                    }
                                }
                            });
                        }
                    }else{
                        $('.weui-dialog .weui-dialog__bd').html('请填写完整信息！'); 
                        var $androidDialog2 = $('#Dialog2');
                        $androidDialog2.fadeIn(200); 
                    }
                }else{//密码不一致
                    $('.weui-dialog .weui-dialog__bd').html('两次密码不一致或者未输入密码！'); 
                    var $androidDialog2 = $('#Dialog2');
                    $androidDialog2.fadeIn(200);
                }
            // }
        });
    }else if($('.person').size()>0){//个人中心
        var _token = localStorage.getItem('access_token');
        
        if(_token == undefined){//若没有token,则需要先登录
            window.location.href = './login.html';
        }else{
            var allVisitTime;
            // 页面加载发起请求
            $.ajax({
                headers: {
                    'Authorization': 'bearer '+_token
                },
                type: "GET",
                url: medicine_url + '/v1.0.0/personalCenter/getPersonalInfo',
                contentType:"json",
                dataType: "json",
                success: function(data){
                    $.ajax({
                        headers: {
                            'Authorization': 'bearer '+_token
                        },
                        type: "GET",
                        url: medicine_url + '/v1.0.0/queryUserComboVisitTimes',
                        contentType:"json",
                        dataType: "json",
                        success: function(data2){
                            if(data.code == 0 && data2.code == 0){//请求数据正常
                                $('.weui-loadmore').addClass('dis-no');//隐藏加载更多
                                $('.person').removeClass('dis-no');
                                allVisitTime = data2.object.allVisitTime;
                                if(data.object.nick !==undefined){
                                    var name = data.object.nick;
                                }else if(data.object.nick ==undefined && data.object.phone !==undefined){
                                    var name = data.object.phone;
                                }else if(data.object.nick ==undefined && data.object.phone ==undefined){
                                    var name = data.object.email;
                                }
                                if (data.object.birth !== undefined && data.object.birth.length>0) {
                                    var str = data.object.birth.substring(0,10);
                                    var r = str.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);     
                                    var d= new Date(r[1],r[3]-1,r[4]);     
                                    if (d.getFullYear()==r[1]&&(d.getMonth()+1)==r[3]&&d.getDate()==r[4]){   
                                        var Y = new Date().getFullYear(); 
                                        var age = Y-r[1]+'岁';
                                    }
                                }else{
                                    var age = null;
                                }
                                
                                var app = new Vue({
                                    el: '#app',
                                    data: {
                                        name: name,
                                        totalCredits:data.object.totalCredits,
                                        realName:data.object.realName,
                                        allVisitTime:allVisitTime,
                                        sex:data.object.gender,
                                        age:age,
                                        vip:data.object.memberType,
                                        inviteNumber:data.object.inviteNumber,
                                        person:data.object
                                    }
                                });
                            }
                            to_login(data);
                        }
                    });
                }
            });
        }
        $('#showDatePicker2').live('click',function(e){//神庭问道弹窗
            // 弹窗
            var $androidActionSheet = $('#androidActionsheet');
            var $androidMask = $androidActionSheet.find('.weui-mask');
            $androidActionSheet.css('display','block');
            $androidActionSheet.css('opacity','1');
            $androidMask.on('click',function () {
                $androidActionSheet.css('display','none');
            });
        });
        $('.person .time_sure').live('click',function(){//神庭问道弹窗
            var $androidActionSheet = $('#androidActionsheet');
            var $androidMask = $androidActionSheet.find('.weui-mask');
            $androidActionSheet.css('display','none');
            $androidMask.on('click',function () {
                $androidActionSheet.css('display','none');
            });
        });
        $('.quit_account').live('click',function(e){//退出弹窗
            // 弹窗
            var $androidActionSheet = $('#quit_account');
            var $androidMask = $androidActionSheet.find('.weui-mask2');
            $androidActionSheet.css('display','block');
            $androidActionSheet.css('opacity','1');
            $androidMask.css('display','block');
            $androidMask.on('click',function () {
                $androidActionSheet.css('display','none');
            });
        });
        $('.person .quit_sure,.person .time_cancel').live('click',function(){//退出弹窗
            var $androidActionSheet = $('#quit_account');
            var $androidMask = $androidActionSheet.find('.weui-mask2');
            $androidActionSheet.css('display','none');
            $androidMask.on('click',function () {
                $androidActionSheet.fadeIn(200);
                $androidActionSheet.css('display','none');
            });
            if ($(this).hasClass('quit_sure')) {//退出确认
                localStorage.removeItem("access_token");
                window.location.href='./login.html';
            }else if ($(this).hasClass('time_cancel')) {//退出取消
                return false;
            }
        });
    }else if($('.m_order').size()>0){//订单页面
        var _token = localStorage.getItem('access_token');
        var page = 0;//默认第一页
        var order_status = 'all';
        var app = new Vue({
            el: '#my_order',
            data: {
                orders:[],
                page:[],
                status:'all_order',
                current:1,//当前页面
                has_noinfo:false,//没有数据
                loading:true,//加载
                show_page:false,//是否显示页面
                not_pay:false,//默认已支付
            },
            created:function(){
                var that = this;
                $.ajax({
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "POST",
                    url: weixin_url + '/order/prescription-order/list?page='+page,
                    contentType:"application/json",
                    data: JSON.stringify({status:order_status}),
                    dataType: "json",
                    success: function(data){
                        if(data.code == 0){//请求数据正常
                            var Data_length =  data.page.content.length;
                            if (Data_length == 0) {
                                that.show_page = false;
                                that.has_noinfo = true;
                                that.loading = false;
                                return;
                            }else{//请求到数据
                                that.orders = data.page.content;//改变页面内容
                                that.page = data.page;
                                that.show_page = true;
                                that.has_noinfo = false;
                                that.loading = false;
                            }
                        }   
                        to_login(data);
                    }
                }); 
            },
            methods:{
                change_status: function (event) {
                    var that =this;
                    var class_name = event.target.className;
                    var class_name2 = event.target.className.split(" ")[1]
                    var is_active = class_name.indexOf('active');
                    if (is_active !==-1) {//被选中
                        return;
                    }else{
                        if (class_name2 == 'all_order') {  //全部订单
                            var order_status = 'all';  
                            that.status = 'all_order';//改变页面内容
                        }else if(class_name2 == 'ordering'){
                            var order_status = 'underway';
                            that.status = 'ordering';//改变页面内容
                        }else if(class_name2 == 'ordered'){
                            var order_status = 'complete';
                            that.status = 'ordered';//改变页面内容
                        }else if(class_name2 == 'notpay'){
                            var order_status = 'notpay';
                            that.status = 'notpay';//改变页面内容
                        }
                        if(class_name2 == 'notpay'){//请求未支付订单
                            that.show_page = false;
                            that.has_noinfo = false;
                            that.loading = true;
                            that.not_pay = true;
                            var page = 0;
                            $.ajax({
                                headers: {
                                    'Authorization': 'bearer '+_token
                                },
                                type: "GET",
                                url: weixin_url + '/order/prescription/wait-for-pay?page='+page,
                                contentType:"application/json",
                                dataType: "json",
                                success: function(data){
                                    if(data.code == 0){//请求数据正常
                                        that.current = 1;
                                        var Data_length =  data.page.content.length;
                                        if (Data_length == 0) {
                                            that.show_page = false;
                                            that.has_noinfo = true;
                                            that.loading = false;
                                            return;
                                        }else{//请求到数据
                                            that.orders = data.page.content;//改变页面内容
                                            that.page = data.page;
                                            that.show_page = true;
                                            that.has_noinfo = false;
                                            that.loading = false;
                                        }
                                    }   
                                    to_login(data);
                                }
                            });

                        }else{
                            that.show_page = false;
                            that.has_noinfo = false;
                            that.loading = true;
                            that.not_pay = false;
                            var page = 0;
                            $.ajax({
                                headers: {
                                    'Authorization': 'bearer '+_token
                                },
                                type: "POST",
                                url: weixin_url + '/order/prescription-order/list?page='+page,
                                contentType:"application/json",
                                data: JSON.stringify({status:order_status}),
                                dataType: "json",
                                success: function(data){
                                    if(data.code == 0){//请求数据正常
                                        that.current = 1;
                                        var Data_length =  data.page.content.length;
                                        if (Data_length == 0) {
                                            that.show_page = false;
                                            that.has_noinfo = true;
                                            that.loading = false;
                                            return;
                                        }else{//请求到数据
                                            that.orders = data.page.content;//改变页面内容
                                            that.page = data.page;
                                            that.show_page = true;
                                            that.has_noinfo = false;
                                            that.loading = false;
                                        }
                                    }   
                                    to_login(data);
                                }
                            });
                        }
                    }
                },
                change_page:function(event){
                    var that =this;
                    var class_name = event.target.className;
                    var num = event.target.innerHTML;
                    var is_active = class_name.indexOf('active');
                    if (is_active !==-1) {//被选中
                        return;
                    }else{
                        that.show_page = false;
                        that.has_noinfo = false;
                        that.loading = true;
                        that.current = num;
                        var page = num-1;
                        var order_status = that.status;
                        if (order_status == 'all_order') {  //全部订单
                            var order_status = 'all';  
                        }else if(order_status == 'ordering'){
                            var order_status = 'underway';
                        }else if(order_status == 'ordered'){
                            var order_status = 'complete';
                        }else if(order_status == 'notpay'){
                            var order_status = 'notpay';
                        }
                        if(order_status == 'notpay'){//请求未支付订单
                            that.show_page = false;
                            that.has_noinfo = false;
                            that.loading = true;
                            that.not_pay = true;
                            var page = page;
                            $.ajax({
                                headers: {
                                    'Authorization': 'bearer '+_token
                                },
                                type: "GET",
                                url: weixin_url + '/order/prescription/wait-for-pay?page='+page,
                                contentType:"application/json",
                                dataType: "json",
                                success: function(data){
                                    if(data.code == 0){//请求数据正常
                                        var Data_length =  data.page.content.length;
                                        if (Data_length == 0) {
                                            that.show_page = false;
                                            that.has_noinfo = true;
                                            that.loading = false;
                                            return;
                                        }else{//请求到数据
                                            that.orders = data.page.content;//改变页面内容
                                            that.page = data.page;
                                            that.show_page = true;
                                            that.has_noinfo = false;
                                            that.loading = false;
                                        }
                                    }   
                                    to_login(data);
                                }
                            });
                        }else{
                            $.ajax({
                                headers: {
                                    'Authorization': 'bearer '+_token
                                },
                                type: "POST",
                                url: weixin_url + '/order/prescription-order/list?page='+page,
                                contentType:"application/json",
                                data: JSON.stringify({status:order_status}),
                                dataType: "json",
                                success: function(data){
                                    if(data.code == 0){//请求数据正常
                                        var Data_length =  data.page.content.length;
                                        if (Data_length == 0) {
                                            that.show_page = false;
                                            that.has_noinfo = true;
                                            that.loading = false;
                                            return;
                                        }else{//请求到数据
                                            that.orders = data.page.content;//改变页面内容
                                            that.page = data.page;
                                            that.show_page = true;
                                            that.has_noinfo = false;
                                            that.loading = false;
                                        }
                                    }   
                                    to_login(data);
                                }
                            });
                        }
                    }
                },
                to_pay:function(order){//跳转到待支付页面
                    localStorage.setItem("order_info",JSON.stringify(order));
                    window.location.href='./order-detail.html';
                }
            }
        });
    }else if($('.m_coupon').size()>0){//优惠券页面
        var _token = localStorage.getItem('access_token');
        var coupon_status = 'can_use';//默认值
        if (coupon_status == 'can_use') {
             var _url = medicine_url + '/v1.0.0/discount-coupon/usable-coupon';
        }else if(coupon_status == 'history'){
             var _url =  medicine_url + '/v1.0.0/discount-coupon/disable-coupon-used';
        }
        var app = new Vue({
            el: '#my_coupon',
            data: {
                my_coupons:[],//默认数据为空
                status:'can_use',
                has_noinfo:false,//没有数据
                loading:true,//加载
                show_page:false,//是否显示页面
            },
            created:function(){
                var that = this;
                $.ajax({
                    headers: {
                        'X-St-Token': _token
                    },
                    type: "GET",
                    url:_url,
                    contentType:"application/json",
                    success: function(data){
                        if (data.code == 0) {
                            var Data_length =  data.object.length;
                            if (Data_length == 0) {
                                that.show_page = false;
                                that.has_noinfo = true;
                                that.loading = false;
                                return;
                            }else{//请求到数据
                                that.my_coupons = data.object;//改变页面内容
                                that.show_page = true;
                                that.has_noinfo = false;
                                that.loading = false;
                            }
                        }
                        to_login(data);
                    }
                });
            },
            methods:{
                change_status:function(event){
                    var that =this;
                    var status = event.target.className.split(" ")[1];
                    var coupon_status = status;//默认值
                    that.show_page = false;
                    that.has_noinfo = false;
                    that.loading = true;

                    if (coupon_status == 'can_use') {
                         var _url = medicine_url + '/v1.0.0/discount-coupon/usable-coupon';
                        that.status = 'can_use';//改变页面内容
                    }else if(coupon_status == 'history'){
                         var _url =  medicine_url + '/v1.0.0/discount-coupon/disable-coupon-used';
                        that.status = 'history';//改变页面内容
                    }
                    var class_name = event.target.className;
                    var is_active = class_name.indexOf('active');
                    if (is_active !==-1) {//被选中
                        return;
                    }else{
                        var that = this;
                        $.ajax({
                            headers: {
                                'X-St-Token': _token
                            },
                            type: "GET",
                            url:_url,
                            contentType:"application/json",
                            success: function(data){
                                if (data.code == 0) {
                                    var Data_length =  data.object.length;
                                    if (Data_length == 0) {
                                        that.show_page = false;
                                        that.has_noinfo = true;
                                        that.loading = false;
                                        return;
                                    }else{//请求到数据
                                        that.my_coupons = data.object;//改变页面内容
                                        that.show_page = true;
                                        that.has_noinfo = false;
                                        that.loading = false;
                                    }
                                }
                                to_login(data);
                            }
                        });
                    }
                }
            }
        });
    }else if($('.doctor_list').size()>0){//医生列表页
        var _token = localStorage.getItem('access_token');
        var app = new Vue({
            el: '#doctor_list',
            data: {
                doctors:[],//初始化数据
                has_noinfo:false,//没有数据
                loading:true,//加载
                show_page:false,//是否显示页面
                week:[],//数据初始化
                doctorAppointmentDisableTimeMap:[],//医生不上班日期
            },
            created:function(){
                var that =this;
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "GET",
                    url:assistant_url + '/common/doctorList',
                    contentType:"application/json",
                    success: function(data){
                        if (data.code == 0) {
                            var Data_length =  data.doctors.length;
                            if (Data_length == 0) {
                                that.show_page = false;
                                that.has_noinfo = true;
                                that.loading = false;
                                return;
                            }else{//请求到数据
                                that.doctors = data.doctors;//改变页面内容
                                that.week = data.doctorAppointmentScheduleMap;
                                that.doctorAppointmentDisableTimeMap = data.doctorAppointmentDisableTimeMap;
                                that.show_page = true;
                                that.has_noinfo = false;
                                that.loading = false;
                            }
                        }
                        to_login(data);
                    }
                });
            },
            methods:{
                setname:function(doctor,map){//预约的医生详情
                    localStorage.setItem("doctor_detail",JSON.stringify(doctor));
                    var map = this.week[doctor.id];
                    localStorage.setItem("map",JSON.stringify(map));
                    window.location.href='./doctor-detail.html';
                },
                reserve:function(doctor,week,doctorAppointmentDisableTimeMap){
                    localStorage.setItem("doctor_detail",JSON.stringify(doctor));
                    window.location.href='./reserve.html?id='+doctor.id;
                    localStorage.setItem("doctor",doctor.name);
                    localStorage.setItem("doctor_map",JSON.stringify(week));
                    localStorage.setItem("doctorAppointmentDisableTimeMap",JSON.stringify(doctorAppointmentDisableTimeMap));
                },
                reserve_phys:function(){
                    alert("理疗预约电话：19983524629 或者 028-84179918");
                }
            }
        });
    }else if($('.m_reserve').size()>0){//预约页面
        var _token = localStorage.getItem('access_token');
        if (_token !==null){//判断token存在
            // 实例化对象
            var app = new Vue({
                el: '#my_serve',
                data: {
                    my_doctors:[],//初始化数据
                    is_show:true,//初始化隐藏
                    do_time:[],
                    doctor:[],
                    _date:[],//日期
                    _time:[],//时间
                    has_noinfo:false,//没有数据
                    loading:false,//加载
                    show_page:true,//是否显示页面
                    doctor_id:[],
                    doctor_name:[],
                    person:[],
                    work_time:[],
                    is_work:false,//医生是否上班
                    appointmentName:[],//预约人
                    doctorAppointmentDisableTimeMap:[],//不上班日期
                },
                created:function(){
                    var that = this;
                    var url=location.href;
                    var i=url.indexOf('?');
                    if(i==-1)return;//无跳转则返回
                    var querystr=url.substr(i+1);
                    var arr1=querystr.split('&');
                    var arr2=new Object();
                    for  (i in arr1){
                        var ta=arr1[i].split('=');
                        arr2[ta[0]]=ta[1];
                    }
                    that.doctor_id = arr2.id;//医生的id
                    var doctor = localStorage.getItem('doctor');
                    var doctorAppointmentDisableTimeMap = localStorage.getItem('doctorAppointmentDisableTimeMap');//不上班日期
                    that.doctorAppointmentDisableTimeMap = doctorAppointmentDisableTimeMap;
                    that.doctor_name = doctor;
                    that.doctor = doctor;
                    that.is_work = true;
                    $.ajax({
                        headers: {
                            'Authorization': 'bearer '+_token
                        },
                        type: "GET",
                        url: medicine_url + '/v1.0.0/personalCenter/getPersonalInfo',
                        contentType:"json",
                        dataType: "json",
                        success: function(data){
                            if(data.code == 0){
                                that.person = data.object;
                                that.appointmentName =  data.object.inviteNumber;
                            }
                            to_login(data);
                        }
                    });
                },
                methods:{
                    choose:function(event){//选日期
                        var that = this;
                        // 日期选择器
                        $('#showDatePicker').live('click', function () {
                            var year = new Date().getFullYear();
                            weui.datePicker({
                                start: year,
                                end: new Date().getFullYear(),
                                defaultValue: [new Date().getFullYear(), new Date().getMonth()+1, new Date().getDate()],
                                onConfirm: function (result) {
                                    // _dd为选择预约的时间
                                    if (result[1]<10 && result[2]<10){//月和日小于10
                                        var _dd = result[0] + '-' + '0'+ result[1] +'-0'+  result[2];
                                        var _content = result[0] + '年' + '0'+ result[1] +'月'+ '0'+ result[2] + '日';
                                    }else if(10 <= result[1] && result[2]<10){//月大于等于10，日小于10
                                        var _dd = result[0] + '-' + result[1] +'-0'+  result[2];
                                        var _content = result[0] + '年' + result[1] +'月'+'0'+  result[2] + '日';
                                    }else if(result[1]<10 && 10 <= result[2]){//月小于10，,日大于等于10
                                        var _dd = result[0] + '-0' + result[1] +'-' + result[2];
                                        var _content = result[0] + '年' +'0'+ result[1] +'月'+  result[2] + '日';
                                    }else if(10<=result[1] && 10 <= result[2]){//月和日大于等于10
                                        var _dd = result[0] + '-' + result[1] + '-'+ result[2];
                                        var _content = result[0] + '年' + result[1] +'月'+  result[2] + '日';
                                    }
                                    var now = new Date();
                                    var year = now.getFullYear();
                                    var month =(now.getMonth() + 1).toString();
                                    var day = (now.getDate()).toString();
                                    if (month.length == 1) {
                                        month = "0" + month;
                                    }
                                    if (day.length == 1) {
                                        day = "0" + day;
                                    }
                                    // 三周以内，以今天的时间为参照
                                    var la_y = Number(year);
                                    var la_m = Number(month);
                                    var la_d = Number(day) + 21;//三周为21天，所以以21天计,截止天
                                    var to_day = year +'-'+ month +'-'+  day;
                                    var _id = JSON.parse(localStorage.getItem('doctor_detail')).id;
                                    var doctorAppointmentDisableTimeMap =JSON.parse(that.doctorAppointmentDisableTimeMap);
                                    var _data = doctorAppointmentDisableTimeMap[_id];
                                    switch(la_m){
                                        case 1:
                                        case 3:
                                        case 5:
                                        case 7:
                                        case 8:
                                        case 10://每月31天
                                            if(la_m == 10){//10月
                                                if ((la_d-31) <0){
                                                    var last_date = la_y +'-'+ (la_m + 1) +'-' + la_d;
                                                }else{
                                                    var last_date = la_y +'-'+ (la_m + 1) +'-0' + (la_d-31);
                                                }
                                            }else{//1.3.5.7.8月
                                                if ((la_d-31) <0){
                                                    var last_date = la_y +'-0'+ la_m  +'-'+ la_d;
                                                }else{
                                                    var last_date = la_y +'-0'+ (la_m + 1) +'-' + (la_d-31);
                                                }
                                            }
                                            break;
                                        case 12://本月31天
                                            if ((la_d-31) <0){
                                                var last_date = la_y +'-'+ la_m +'-' + la_d;
                                            }else{
                                                var last_date = (la_y + 1) +'-01' +'-0' + (la_d-31);
                                            } 
                                            break;
                                        case 4:
                                        case 6:
                                        case 9:
                                        case 11://每月30天
                                            if (la_m == 9) {
                                                if ((la_d-30) <0){
                                                    var last_date = la_y +'-0'+ la_m +'-' + la_d;
                                                }else{
                                                    var last_date = la_y  +'-' + (la_m + 1)+'-' + (la_d-30);
                                                } 
                                            }else if(la_m == 11){
                                                if ((la_d-30) <0){
                                                    var last_date = la_y +'-'+ la_m +'-' + la_d;
                                                }else{
                                                    var last_date = la_y  +'-' + (la_m + 1)+'-' + (la_d-30);
                                                } 
                                            }else{
                                                if ((la_d-30) <0){
                                                    var last_date = la_y +'-0'+ la_m +'-' + la_d;
                                                }else{
                                                    var last_date = la_y  +'-0' + (la_m + 1)+'-' + (la_d-30);
                                                } 
                                            }
                                            break;
                                        case 2:
                                            if (la_y % 4 == 0 && la_y % 100 !== 0){//如果是闰年，2月为29天
                                                if ((la_d-29) <0){
                                                    var last_date = la_y +'-0'+ la_m +'-' + la_d;
                                                }else{
                                                    var last_date = la_y  +'-0' + (la_m + 1)+'-' + (la_d-29);
                                                } 

                                            }else{//平年，2月为28天
                                                if ((la_d-28) <0){
                                                    var last_date = la_y +'-0'+ la_m +'-' + la_d;
                                                }else{
                                                    var last_date = la_y  +'-0' + (la_m + 1)+'-' + (la_d-28);
                                                } 
                                            }
                                            break;
                                    }
                                    var not_work;
                                    for (var i=0;i<_data.length;i++) {
                                        if (_data[i] == _dd) {
                                            not_work = true;
                                        }
                                    }
                                    if (_dd > last_date || _dd < to_day || _dd == to_day){//预约时间不正确(超出预约最终时间或小于等于今天时间)
                                        $('.reservse_time').css('display','block');
                                        $('.reservse_time').css('opacity','1');
                                        $('.DatePicker .weui-cell__bd').html('');
                                    }else if(not_work == true){
                                        that.is_work = false;
                                        $('.DatePicker .weui-cell__bd').html('');
                                        $('.weui-skin_android').removeClass('dis-no');
                                    }else{//格式正确
                                        $('.DatePicker .weui-cell__bd').html(_content);
                                        var date = $('.re_date').html();
                                        $('.re_time').html('');
                                        var dateStr1 = date.replace('年','-');
                                        var dateStr2 = dateStr1.replace('月','-');
                                        var dateStr3 = dateStr2.replace('日','');//最终日期
                                        that._date = dateStr3;//日期
                                        return;
                                    }
                                    $('.reservse_time .time-sure3').live('click',function(){
                                        $('.reservse_time').css('opacity','0');
                                        $('.reservse_time').css('display','none');
                                    });
                                }
                            });
                        });
                    },
                    choose2:function(e){//选时间
                        var that = this;
                        if($('.time_container').find('.active').hasClass('selected')){
                            $('.weui-skin_android').addClass('dis-no');
                            var _content1 = $('.can_reserve.active.selected').parents('.text_center').find('p.tint').html();
                            var _content2 = $('.can_reserve.active.selected').html();
                            var _content = _content1 +" "+ _content2;
                            $('.DatePicker2 .weui-cell__bd').html(_content);
                            $('.weui-skin_android').addClass('dis-no');
                            $('.can_reserve.active').removeClass('selected');
                            that._time = _content2;
                        }else{
                            $('.weui-skin_android').addClass('dis-no');
                            $('.can_reserve.active').removeClass('selected');
                        }
                    },
                    choose_doctor:function(doctor){
                        var that = this;
                        that.doctor = doctor;
                    },
                    show_modal:function(){//发起请求，获取医生空余时间
                        var that = this;
                        var _date = that._date;
                        var doctor_id = that.doctor_id;
                        var doctor_time = [{_time:"09:00",status:"active"},
                        {_time:"09:15",status:"active"},
                        {_time:"09:30",status:"active"},
                        {_time:"09:45",status:"active"},
                        {_time:"10:00",status:"active"},
                        {_time:"10:15",status:"active"},
                        {_time:"10:30",status:"active"},
                        {_time:"10:45",status:"active"},
                        {_time:"11:00",status:"active"},
                        {_time:"11:15",status:"active"},
                        {_time:"11:30",status:"active"},
                        {_time:"11:45",status:"active"},
                        {_time:"14:00",status:"active"},
                        {_time:"14:15",status:"active"},
                        {_time:"14:30",status:"active"},
                        {_time:"14:45",status:"active"},
                        {_time:"15:00",status:"active"},
                        {_time:"15:15",status:"active"},
                        {_time:"15:30",status:"active"},
                        {_time:"15:45",status:"active"},
                        {_time:"16:00",status:"active"},
                        {_time:"16:15",status:"active"},
                        {_time:"16:30",status:"active"},
                        {_time:"16:45",status:"active"},
                        {_time:"17:00",status:"active"},
                        {_time:"17:15",status:"active"}];//医生上班时间

                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "GET",
                            url:assistant_url +'/assistant/appointment/appointmentTimeRecordByDay/'+_date+'/'+doctor_id,
                            contentType:"application/json",
                            success: function(data){
                                $('.weui-skin_android').removeClass('dis-no');
                                var doctor_detail = JSON.parse(localStorage.getItem('doctor_map'));
                                if (data.code == 0) {//请求到正常数据，医生上班
                                    that.is_work = true;
                                    var Data_length =  data.appointmentTimes.length;
                                    var work_time = doctor_time;//每次单击进行数据覆盖
                                    if (Data_length == 0) {//医生没有被预约
                                        that.is_work = true;
                                        that.work_time = work_time;
                                        that.person.inviteNumber = $('.re_name').val();
                                        that.person.phone =  $('.re_tel').val();
                                        return;
                                    }else{//医生时间被占用，数据处理
                                        for(var i = 0 ;i<work_time.length;i++){
                                            for(var j = 0;j<data.appointmentTimes.length;j++){
                                                if(work_time[i]._time == data.appointmentTimes[j]){
                                                    work_time[i].status='notactive';
                                                }
                                            }
                                        }
                                        that.is_work = true;
                                        that.person.inviteNumber = $('.re_name').val();
                                        that.person.phone =  $('.re_tel').val();
                                        that.work_time = work_time;
                                    }
                                }else if (data.code == 1){//医生当天不上班
                                    that.is_work = false;
                                }else if(data.code == 99){
                                    that.is_work = false;
                                }
                                to_login(data);
                            }
                        });
                    },
                    resure:function(e){//确认预约
                        var that = this;
                        var re_name = $('.re_name').val();
                        var re_sex = $('.weui-select.re_gender').val();
                        var re_tel = $('.re_tel').val();
                        var re_date = $('.re_date').html();
                        var re_time = $('.re_time').html();
                        var doc_name = $('.doc_name').html();
                        var appointmentName = that.appointmentName;
                        var doctor = JSON.parse(localStorage.getItem('doctor_detail')); 
                        var _date = that._date;
                        var _time = that._time;
                        var _time = _date +'T'+_time;
                        var _token = localStorage.getItem('access_token');
                        $('#quit_account').css('display','none');
                        if (re_name.length >0 && re_sex.length >0 && re_tel.length >0 &&re_date.length >0 &&re_time.length >0 && doc_name.length >0 ){
            
                            $.ajax({//发起请求
                                headers: {
                                    'Authorization': 'bearer '+_token
                                },
                                type: "POST",
                                url:assistant_url + '/assistant/appointment/saveAppointment',
                                contentType:"application/json",
                                // visitName:就诊人，appointmentName：预约人
                                data: JSON.stringify({appointmentTime:_time,remark:'',doctorEntity:doctor,appointmentName:appointmentName,visitName:re_name,phone:re_tel}),
                                success: function(data){
                                    if (data.code == 0) {
                                            window.location.href='./reserve-success.html';
                                    }else{
                                        $('.fail.js_tooltips').html(data.message);
                                        $('.fail.js_tooltips').css('display','block');
                                        setTimeout(function(){
                                            $('.fail.js_tooltips').css('display','none');
                                        },2000)
                                    }
                                    to_login(data);
                                }
                            });
                        }else{
                            return;
                        }
                    },
                    cancel:function(){
                        $('#quit_account').css('display','none');
                    },
                    hidden_modal:function(){//隐藏模态框
                        $('.weui-skin_android').addClass('dis-no');
                        $('.can_reserve.active').removeClass('selected');
                    }
                }
            });
            // 时间选中效果
            $('.choose_time div.fl.active').live('click',function(e){
                e.preventDefault();
                e.stopPropagation();
                if($(this).hasClass('selected')){//如果被选中
                    $(this).removeClass('selected');
                }else{
                    $('.choose_time div.fl').removeClass('selected');
                    $(this).addClass('selected');
                }
            });
            $('.choose_time div.fl').live('click',function(e){
                $(this).css('background-color','#fff');
                $(this).css('outline','none');
            })
            // 选中医生
            $('.doctor_pic input').live('click',function(e){
                var do_name = $(this).siblings('.flex-1').find('.doname').html();
                $('.doc_name').html(do_name);
            });
            $('.weui-btn.weui-btn_primary').live('click',function(){//弹窗确认
                var re_name = $('.re_name').val();
                var re_sex = $('.weui-select.re_gender').val();
                var re_tel = $('.re_tel').val();
                var re_date = $('.re_date').html();
                var re_time = $('.re_time').html();
                var doc_name = $('.doc_name').html();
                if (re_name.length >0 && re_sex.length >0 && re_tel.length >0 &&re_date.length >0 &&re_time.length >0 && doc_name.length >0 ){
                    var $androidActionSheet = $('#quit_account');
                    var $androidMask = $androidActionSheet.find('.weui-mask2');
                    $androidActionSheet.fadeIn(200);
                    $androidMask.on('click',function () {
                        $androidActionSheet.fadeOut(200);
                    });
                }else{
                    $('.reserve_.js_dialog').css('display','block');
                    $('.reserve_.js_dialog').css('opacity','1');
                    $('.weui-dialog.weui-skin_android').css('block');
                }
                
            });
            $('.js_dialog.reserve_ .weui-dialog__btn_primary').live('click',function(){
                $('.reserve_.js_dialog').css('display','none');
                $('.reserve_.js_dialog').css('opacity','0');
            });
        }else{//返回登录
            window.location.href='./login.html';
        }
    }else if($('.msg_success').size()>0){//预约成功页面
        // $('.go_last').on('click',function(){
        //     window.history.go(-1);
        // });

    }else if($('.order_detail').size()>0){
        var _token = localStorage.getItem('access_token');
        var page = 0;//默认第一页
        var app = new Vue({
            el: '#order_detail',
            data: {
                my_orders:[],
                has_noinfo:false,//没有数据
                loading:true,//加载
                show_page:false,//是否显示页面
                reserve_id:[],//取消id
                show_modal:false,
                page:[],
                current:1,//当前页面
            },
            created:function(){
                var that = this;
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "GET",
                    url:weixin_url + '/appointment/user-appointment-list?page='+page,
                    contentType:"application/json",
                    success: function(data){
                        if (data.code == 0) {
                            that.current = 1;
                            var Data_length =  data.page.content.length;
                            if (Data_length == 0) {
                                that.show_page = false;
                                that.has_noinfo = true;
                                that.loading = false;
                                return;
                            }else{//请求到数据
                                that.my_orders = data.page.content;
                                that.show_page = true;
                                that.page = data.page;
                                that.has_noinfo = false;
                                that.loading = false;
                            }
                        }
                        to_login(data);
                    }
                });
            },
            methods:{
                cancel_reserve:function(my_order){//取消按钮
                    var that = this;
                    var reserve_time = my_order.appointmentTime;
                    var _str = reserve_time.split('-')[2];
                    var _dd = Number(_str.split('T')[0]);
                    var now = new Date();
                    var day = Number(now.getDate());
                    that.reserve_id = my_order.id;
                    if(_dd == day){
                        that.show_modal = true;
                    }else{
                        that.resure();
                    }
                },
                resure:function(){//确认取消
                    var that = this;
                    var reserve_id = that.reserve_id;
                    that.show_modal = false;
                    that.show_page = false;//隐藏页面
                    that.loading = true;
                    $.ajax({//发起请求
                        headers: {
                            'Authorization': 'bearer '+_token
                        },
                        type: "GET",
                        url:weixin_url + '/appointment/cancelAppointment/'+reserve_id,
                        contentType:"application/json",
                        success: function(data){
                            if (data.code == 0) {
                                $.ajax({//发起请求
                                    headers: {
                                        'Authorization': 'bearer '+_token
                                    },
                                    type: "GET",
                                    url:weixin_url + '/appointment/user-appointment-list',
                                    contentType:"application/json",
                                    success: function(data2){
                                        that.show_page = true;//隐藏页面
                                        that.loading = false;
                                        $('#cancel_info').css('display','block');
                                        setTimeout(function(){
                                            $('#cancel_info').css('display','none');
                                        },1500);
                                        if (data2.code == 0) {
                                            var Data_length =  data2.page.content.length;
                                            if (Data_length == 0) {
                                                that.show_page = false;
                                                that.has_noinfo = true;
                                                that.loading = false;
                                                return;
                                            }else{//请求到数据
                                                that.my_orders = data2.page.content;
                                                that.show_page = true;
                                                that.has_noinfo = false;
                                                that.loading = false;
                                            }
                                        }
                                        to_login(data);
                                    }
                                });
                            }
                            to_login(data);
                        }
                    }); 
                },
                cancel:function(){//取消
                    var that = this;
                    that.show_modal = false;
                },
                change_page:function(event){
                    var that =this;
                    var class_name = event.target.className;
                    var num = event.target.innerHTML;
                    var is_active = class_name.indexOf('active');
                    if (is_active !==-1) {//被选中
                        return;
                    }else{
                        that.show_page = false;
                        that.has_noinfo = false;
                        that.loading = true;
                        that.current = num;
                        var page = num-1;
                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "GET",
                            url:weixin_url + '/appointment/user-appointment-list?page='+page,
                            contentType:"application/json",
                            success: function(data){
                                if (data.code == 0) {
                                    var Data_length =  data.page.content.length;
                                    if (Data_length == 0) {
                                        that.show_page = false;
                                        that.has_noinfo = true;
                                        that.loading = false;
                                        return;
                                    }else{//请求到数据
                                        that.my_orders = data.page.content;
                                        that.show_page = true;
                                        that.page = data.page;
                                        that.has_noinfo = false;
                                        that.loading = false;
                                    }
                                }
                                to_login(data);
                            }
                        });
                    }
                },
            }
        });
    }else if($('.doctor_detail').size()>0){
        var doctor_detail = JSON.parse(localStorage.getItem('doctor_detail'));
        var map = JSON.parse(localStorage.getItem('map'));
        var app = new Vue({
            el: '#doctor_detail',
            data: {
                doctor_detail:doctor_detail,
                map:map,
            }
        });
    }else if($('#store_index').size()>0){//商品首页
        var _token = localStorage.getItem('access_token');
        var search_arr=localStorage.getItem('search_arr');
        if (search_arr==null){
            var search_arr = [];
        }else{
            var search_arr = (localStorage.getItem('search_arr')).split(',');
            var search_arr = search_arr;
        } 
        // var _url = document.referrer;
        // var _index = _url.lastIndexOf("\/");  
        // var str  = _url.substring(_index + 1, _url.length);
        // 共用方法获取数据
        // 请求数据方法可公用
        var _token = localStorage.getItem('access_token');
        var that = this;
        function get_info(that,page){
            var total_page = that.total_page;
            if (page < total_page) {//未加载到最后一页
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: 'get',
                    url:weixin_url+'/sale/all-product'+'?page='+page,
                    contentType:"application/json",
                    success: function(data){
                        if (data.code == 0) {
                            var _data = data.page.content;
                            if(_data.length==0){
                                $('.no_all_good').addClass('dis-no');
                                $('.no_good').removeClass('dis-no');
                            }else{
                                $('.no_all_good').addClass('dis-no');
                                $('.no_good').addClass('dis-no');
                                that.total_page = data.page.totalPages;
                                var origin_data = that.all_good;
                                var _content =data.page.content;
                                for(var i=0;i<_content.length;i++){
                                    origin_data.push(_content[i]);
                                }
                                that.all_good = origin_data;
                                $('.more_info').addClass('dis-no');
                            }
                        }else{
                            alert(data.message);
                        }
                        to_login(data);
                    }
                });
            }else{
                $('.no_all_good').addClass('dis-no');
                $('.no_good').removeClass('dis-no');
            }
        }
        var app = new Vue({
            el: '#good_index',
            data: {
                loading:true,
                showpage:false,
                good_info:[],//初始化商品数据
                search_arr:search_arr,
                banner:[],
                all_good:[],//所有数据初始化
                page:0,//初始化页面
                total_page:1,//记录页面总数
            },
            mounted () {//触底事件
                window.addEventListener('scroll', this.handleScroll,true)
            },
            updated:function() {
                var mySwiper = new Swiper('.swiper-container',{
                    loop: false,
                    autoplay: 3000,
                    pagination : '.pagination',
                    paginationClickable :true,
                    freeMode : false,
                    touchRatio : 0.5,
                });
            },
            created:function(){
                var that = this;
                // 页面加载发起请求
                $.ajax({//获取个人数据
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "GET",
                    url: medicine_url + '/v1.0.0/personalCenter/getPersonalInfo',
                    contentType:"json",
                    dataType: "json",
                    success: function(data){
                        if(data.code==0){
                            if(data.object.realName==2){//已经实名认证
                                $.ajax({//获取导航分类
                                    headers: {
                                        'Authorization': 'bearer '+_token
                                    },
                                    type: 'get',
                                    url:weixin_url+'/sale/directory-list',
                                    contentType:"application/json",
                                    success: function(data){
                                        that.loading = false;
                                        that.showpage = true;
                                        if (data.code == 0) {
                                            that.good_info = data.list;
                                        }else{
                                            alert(data.message);
                                        }
                                        to_login(data);
                                    }
                                });
                                $.ajax({//获取banner图
                                    headers: {
                                        'Authorization': 'bearer '+_token
                                    },
                                    type: "GET",
                                    url: weixin_url + '/sale/banner',
                                    contentType:"json",
                                    dataType: "json",
                                    success: function(data){
                                        if(data.code==0){
                                            that.banner = data.list;
                                        }else{
                                            alert(data.message);
                                        }
                                        to_login(data);
                                    }
                                });
                                var page = that.page;
                                get_info(that,page);
                            }else if(data.object.realName==0){
                                alert('未实名认证，请先认证！');
                                window.location.href = './person.html';
                            }else if(data.object.realName==1){
                                alert('实名认证审核中！');
                                window.location.href = './person.html';
                            }else if(data.object.realName==3){
                                alert('实名认证未通过！');
                                window.location.href = './person.html';
                            }
                        }else{
                            alert(data.message);
                        }
                        to_login(data);
                    }
                });
                
            },
            methods:{
                search_btn:function(){//点击‘搜索按钮’
                    var that = this;
                    var _key = $('#input_key').val();
                    var key_arr = that.search_arr;
                    if (_key.length>0) {
                        if (key_arr.length == 0) {
                            key_arr.unshift(_key);
                        }else{
                            var flag = false;
                            for (var i = 0;i<key_arr.length;i++){
                                if (key_arr[i]==_key){
                                    flag=true;
                                    break;
                                }else{
    
                                }
                            }
                            if(!flag){
                                key_arr.unshift(_key);
                            } 
                        }
                        
                        that.search_arr = key_arr;
                        localStorage.setItem("search_arr",key_arr);
                        window.location.href="./search-page.html";
                    }
                },
                delete_record:function(){//清空记录
                    var that = this;
                    that.search_arr = [];
                    localStorage.removeItem("search_arr");
                },
                cla_detail:function(e){//跳转到商品分类列表
                    var dictId = e;
                    window.location.href="./directory.html?dictId="+dictId;
                },
                handleScroll:function(event){
                    // 距离顶部距离
                    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
                    // div高度
                    var offsetHeight = document.querySelector('.good_index').offsetHeight
                    // 页面高度
                    var clientHeight =  window.screen.height ; 
                    if (clientHeight+scrollTop+10>offsetHeight){
                        var that = this;
                        var page = that.page+1;
                        that.page = page;
                        $('.no_all_good').removeClass('dis-no');
                        get_info(that,page);
                    }                   
                },
            }
        });
        $('.search_input').live('focus',function(){
            $('.store_index').addClass('dis-no');
            $('.serach_content').removeClass('dis-no');
        })
        $('.return_ori').live('click',function(){
            $('.store_index').removeClass('dis-no');
            $('.serach_content').addClass('dis-no');
            var mySwiper = new Swiper('.swiper-container',{
                loop: false,
                autoplay: 3000,
                pagination : '.pagination',
                paginationClickable :true,
                freeMode : false,
                touchRatio : 0.5,
             });
        })
    }else if($('.goood_detail').size()>0){//商品详情页
        $('.buy_btn').live('click',function(){
            if($('.sku_mask').hasClass('fade_in')){//如果有蒙版
                $('.sku_mask').removeClass('fade_in');
                $('.sku_mask').addClass('fade_out');
                $(".sku_room").animate({bottom:'-284px'});
            }else{
                $('.sku_mask').addClass('fade_in');
                $('.sku_mask').removeClass('fade_out');
                $(".sku_room").animate({bottom:'0'});
            }
        })
        $('.sku_mask.fade_in,.sku_room .btn_sure,.sku_room .icon-shanchu3').live('click',function(){
            $('.sku_mask').removeClass('fade_in').addClass('fade_out');
            $(".sku_room").animate({bottom:'-284px'});
        })
        // 数量增减
        $('.sku_operate .iconfont').live('click',function(){
            var _num = $('.ope_num').html();
            if($(this).hasClass('icon-jian') && _num >1){//减
                _num--;
                $('.ope_num').html(_num);
            }else if($(this).hasClass('icon-jian') && _num <= 1){//加
                return;
            }else{
                _num++;
                $('.ope_num').html(_num);
            }
        })
    }else if($('.cart').size()>0){//购物车页面
        // 数量增减
        $('.cart .thumb .iconfont').live('click',function(){
            var _num = $(this).siblings('.ope_num').html();
            if($(this).hasClass('icon-jian') && _num >1){//减
                _num--;
                $(this).siblings('.ope_num').html(_num);
            }else if($(this).hasClass('icon-jian') && _num <= 1){//加
                return;
            }else{
                _num++;
                $(this).siblings('.ope_num').html(_num);
            }
        });
        $('#cart .compute_btn .btn').live('click',function(){
            window.location.href="../html/good-sure.html";
        })
    }else if($('#my_coin').size()>0){//我的神庭币页面
        var _token = localStorage.getItem('access_token');
        var page = 0;//默认第一页
        var app = new Vue({
            el: '#my_coin',
            data: {
                has_noinfo:false,//没有数据
                loading:true,//加载
                show_page:false,//是否显示页面
                page:[],
                current:1,//当前页面
                my_balance:[],//数据
                datas:[],//初始数据
                show_modal:false,//欢迎页弹窗,默认没有
                is_agree:false
            },
            created:function(){
                var that = this;
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "GET",
                    url:weixin_url + '/coin/consume-list?page='+page,
                    contentType:"application/json",
                    success: function(data){
                        if (data.code == 0) {
                            that.current = 1;
                            var Data_length =  data.page.content.length;
                            if (Data_length == 0) {
                                that.show_page = false;
                                that.datas = data;
                                that.loading = false;
                                return;
                            }else{//请求到数据
                                that.my_balance = data.page.content;
                                that.show_page = true;
                                that.page = data.page;
                                that.has_noinfo = false;
                                that.loading = false;
                                that.datas = data;
                            }
                        }
                        to_login(data);
                    }
                });
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "GET",
                    url:weixin_url + '/agreement/confirm/agreement_type_coin_use',
                    contentType:"application/json",
                    success: function(data){
                        if (data.code == 0) {
                            that.is_agree = data.confirm;
                            that.show_modal = !data.confirm;
                        }
                        to_login(data);
                    }
                });
            },
            methods:{
                agree_sure:function(){//同意神庭币使用须知
                    var that = this;
                    var is_agree = $('.welcome_page').find('.weui-agree__checkbox').prop('checked');
                    if (is_agree) {//如果同意
                        that.show_modal = false;
                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "POST",
                            url:weixin_url + '/agreement/confirm/agreement_type_coin_use',
                            contentType:"application/json",
                            success: function(data){
                                if (data.code == 0) {
                                    that.is_agree = true;
                                }
                                to_login(data);
                            }
                        });
                    }else{
                        that.show_modal = true; 
                        return;       
                    }
                },
                agree_cancel:function(){//不同意神庭币使用须知
                    this.show_modal = false;
                },
                change_page:function(event){//下一页
                    var that =this;
                    var class_name = event.target.className;
                    var num = event.target.innerHTML;
                    var is_active = class_name.indexOf('active');
                    if (is_active !==-1) {//被选中
                        return;
                    }else{
                        that.show_page = false;
                        that.has_noinfo = false;
                        that.loading = true;
                        that.current = num;
                        var page = num-1;
                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "GET",
                            url:weixin_url + '/coin/consume-list?page='+page,
                            contentType:"application/json",
                            success: function(data){
                                if (data.code == 0) {
                                    var Data_length =  data.page.content.length;
                                    if (Data_length == 0) {
                                        that.show_page = false;
                                        that.has_noinfo = true;
                                        that.loading = false;
                                        return;
                                    }else{//请求到数据
                                        that.my_balance = data.page.content;
                                        that.show_page = true;
                                        that.page = data.page;
                                        that.has_noinfo = false;
                                        that.loading = false;
                                    }
                                }
                                to_login(data);
                            }
                        });
                    }
                },
                modal_page:function(){
                    var that = this;
                    that.show_modal = true;
                },
            }
        });
        $('#my_coin .quit_account button').live('click',function(){//点击“我愿转赠”按钮
            // ajax请求的方法
            var _token = localStorage.getItem('access_token');
            var that = this;
            $.ajax({//发起请求,查询是否设置支付密码
                headers: {
                    'Authorization': 'bearer '+_token
                },
                type: "GET",
                url:weixin_url + '/user/pay-password',
                contentType:"application/json",
                success: function(data){
                    if (data.code == 0) {
                        if(data.payPassword){//如果已经设置支付密码
                            var totalCoin = $('.balance_top .text_center p').html();
                            var _totalCoin = Number(totalCoin.split('个')[0]);
                            if (_totalCoin > 0) {
                                localStorage.setItem("_totalCoin", _totalCoin);
                                window.location.href='./gift.html';
                            }else{
                                return;
                            }
                        }else{//若未设置支付密码
                            // 弹窗
                            var $androidActionSheet = $('#quit_account2');
                            var $androidMask = $androidActionSheet.find('.weui-mask2');
                            $androidActionSheet.fadeIn(200);
                            $androidMask.css('display','block');
                            $androidMask.fadeIn(200);
                            $androidMask.on('click',function () {
                                $androidMask.css('display','none');
                                $androidActionSheet.fadeOut(200);
                            });
                        }
                    }
                    to_login(data);
                }
            });
        });
        $('#my_coin #quit_account2 .quit_sure').live('click',function(e){//设置交易密码
            // ajax请求的方法
            var _token = localStorage.getItem('access_token');
            var that = this;
            var password = $(this).parents('.weui-actionsheet__menu').find('input').val();
            if(password.length == 6){
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "POST",
                    url:weixin_url + '/user/pay-password',
                    contentType:"application/json",
                    data: JSON.stringify({payPassword:password}),
                    success: function(data){
                        if (data.code == 0) {
                            $('#regist_info').css('display','block');
                            setTimeout(function(){
                                $('#regist_info').css('display','none');
                                window.location.href='./gift.html';
                            },2000);
                        }
                        to_login(data);
                    }
                });
            }else{
                $('#my_coin .input_error').removeClass('dis-no');
                $('#my_coin .input_error').html('密码格式错误！');
                setTimeout(function(){
                    $('#my_coin .input_error').addClass('dis-no');
                    $('#my_coin .input_error').html(''); 
                },1000)
            }
        });
        $('#my_coin #quit_account2 .time_cancel').live('click',function(e){//设置交易密码
            var $androidActionSheet = $('#quit_account2');
            var $androidMask = $androidActionSheet.find('.weui-mask2');
            $androidActionSheet.fadeOut(200);
            $androidMask.css('display','none');
        });
    }else if($('#my_gift').size()>0){//神庭币转赠页面
        var _token = localStorage.getItem('access_token');
        var app = new Vue({
            el: '#my_gift',
            data: {
                has_noinfo:true,//没有数据
                loading:false,//加载
                show_page:true,//是否显示页面
                show_user:false,
                realName:false,
                datas:{"userInfo":{"userName":"","phone":"","email":""}},//初始数据
                messege:[],//提示信息
            },
            methods:{
                search:function(){
                    var _token = localStorage.getItem('access_token');
                    var that = this;
                    var username = $('.search_contain').find('input').val();
                    if(username.length>0){
                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "GET",
                            url:weixin_url + '/coin/user-info/'+username,
                            contentType:"application/json",
                            success: function(data){
                                if (data.code == 0) {
                                    that.has_noinfo = false;
                                    that.show_user = true;
                                    that.datas = data;
                                    that.realName = data.userInfo.realName;
                                    $('input.gift_num').val("");
                                }else{
                                    that.show_user = false;
                                    that.datas = {"userInfo":{"userName":"","phone":"","email":""}};
                                    that.has_noinfo = true;
                                    var _content = data.message;
                                    $('#quit_account4 .info_te').html(_content);
                                    var $androidActionSheet = $('#quit_account4');
                                    var $androidMask2 = $androidActionSheet.find('.weui-mask4');
                                    $androidMask2.css('display','block');
                                    $androidActionSheet.fadeIn(200);
                                    $androidMask2.on('click',function () {
                                        $androidMask2.css('display','none');
                                        $androidActionSheet.fadeOut(200);
                                    });
                                }
                                to_login(data);
                            }
                        });
                    }
                },
                sure_gift:function(){
                    var _num = Number($('.gift_num').val());//输入框转赠金额
                    var input_length =($('.user_messege').val()).length;//搜索框
                    var _totalCoin = Number(localStorage.getItem('_totalCoin'));//总共的神庭币
                    var can_use = _num <= _totalCoin;
                    if (input_length > 0 && can_use && _num>0){
                        // 弹窗
                        $('input.user_pass').val("");
                        if($('.text_info').hasClass('realName')){//若实名
                            $('.text_info.realName input').val("");
                        }
                        $('input.user_pass').val("");
                        $('#quit_account').css('display','none');
                        var $androidActionSheet = $('#quit_account2');
                        var $androidMask = $androidActionSheet.find('.weui-mask2');
                        $androidActionSheet.fadeIn(200);
                        $androidMask.css('display','block');
                        $androidMask.fadeIn(200);
                        $androidMask.on('click',function () {
                            $androidMask.css('display','none');
                            $androidActionSheet.fadeOut(200);
                        });
                    }else if(input_length <= 0 && can_use && _num>0){
                        $('#quit_account4 .info_te').html("搜索框内容不能为空！");
                        var $androidActionSheet = $('#quit_account4');
                        var $androidMask2 = $androidActionSheet.find('.weui-mask4');
                        $androidMask2.css('display','block');
                        $androidActionSheet.fadeIn(200);
                        $androidMask2.on('click',function () {
                            $androidMask2.css('display','none');
                            $androidActionSheet.fadeOut(200);
                        });
                        return;
                    }else if(!can_use ||  _num ==0){
                        return;
                    }
                },
                forget_password:function(){//忘记密码
                    $.ajax({//发起请求
                        headers: {
                            'Authorization': 'bearer '+_token
                        },
                        type: 'GET',
                        url:weixin_url + '/user/user-info',
                        contentType:"application/json",
                        success: function(data){
                            if (data.code == 0) {
                                $('#quit_account').css('display','none');
                                var $androidActionSheet = $('#quit_account3');
                                var $androidActionSheet2 = $('#quit_account2');
                                var $androidMask = $androidActionSheet.find('.weui-mask3');
                                var $androidMask2 = $androidActionSheet2.find('.weui-mask2');
                                $androidMask2.css('display','none');
                                $androidMask.css('display','block');
                                $androidActionSheet2.fadeOut(200);
                                $androidActionSheet.fadeIn(200);
                                $androidMask.on('click',function () {
                                    $androidMask.css('display','none');
                                    $androidActionSheet.fadeOut(200);
                                });
                                var email = data.userInfo.email;
                                var phone = data.userInfo.phone;
                                if(email.length>0 && phone.length==0){//只有邮箱
                                    $('.re_phone').addClass('dis-no');
                                    $('.re_email').addClass('active');
                                    $('.email_input').html(email);
                                    $('.phone_input').addClass('dis-no');
                                }else if(email.length==0 && phone.length>0){//只有电话
                                    $('.re_email').addClass('dis-no');
                                    $('.re_phone').addClass('active');
                                    $('.phone_input').html(phone);
                                    $('.email_input').addClass('dis-no');
                                }else{
                                    $('.email_input').html(email);
                                    $('.phone_input').html(phone);
                                    $('.email_input').addClass('dis-no');
                                    $('.re_phone').addClass('active');
                                }
                            }else{

                            }
                            to_login(data);
                        }
                    });
                }
            }
        });
        $('#my_gift #quit_account2 button.time_cancel').live('click',function(){//取消按钮
            var $androidActionSheet2 = $('#quit_account2');
            var $androidMask2 = $androidActionSheet2.find('.weui-mask2');
            $androidActionSheet2.fadeOut(200);
            $androidMask2.fadeOut(200);
        });
        $('#my_gift #quit_account2 button.quit_sure').live('click',function(){//填写密码确认按钮
            var _token = localStorage.getItem('access_token');
            var price = $('.user_info').find('input.gift_num').val();
            var username =  $('.search_contain').find('input.user_messege').val();
            var payPassword = $('.gift_menu').find('input.user_pass').val();
            if(payPassword.length>0){
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "POST",
                    url:weixin_url + '/coin/transfer',
                    contentType:"application/json",
                    data: JSON.stringify({username:username,price:price,payPassword:payPassword}),
                    success: function(data){
                        if (data.code == 0) {
                            var $androidActionSheet2 = $('#quit_account2');
                            var $androidMask2 = $androidActionSheet2.find('.weui-mask2');
                            $androidActionSheet2.fadeOut(200);
                            $androidMask2.fadeOut(200);
                            window.location.href='./gift-success.html';
                        }else{
                            var $androidActionSheet2 = $('#quit_account2');
                            $("#quit_account2 .weui-mask2").css('display','none');
                            $androidActionSheet2.fadeOut(200);
                            var _content = data.message;
                            $('#quit_account .info_te').html(_content);
                            var $androidActionSheet = $('#quit_account');
                            var $androidMask2 = $androidActionSheet.find('.weui-mask2');
                            $androidMask2.css('display','block');
                            $androidActionSheet.fadeIn(200);
                            $androidMask2.on('click',function () {
                                $androidMask2.css('display','none');
                                $androidActionSheet.fadeOut(200);
                            });
                        }
                        to_login(data);
                    }
                });
            }else{
                return false;
            }
            $('#my_gift #quit_account button.quit_sure').live('click',function(){//提醒消息确认
                $('input.user_pass').val("");
                $('#quit_account').css('display','none');
                var $androidActionSheet = $('#quit_account2');
                var $androidActionSheet2 = $('#quit_account');
                var $androidMask = $androidActionSheet.find('.weui-mask2');
                var $androidMask2 = $androidActionSheet2.find('.weui-mask2');
                $androidMask2.css('display','none');
                $androidActionSheet2.fadeOut(200);
                $androidActionSheet.fadeIn(200);
                $androidMask.css('display','block');
                $androidMask.fadeIn(200);
                $androidMask.on('click',function () {
                    $androidMask.css('display','none');
                    $androidActionSheet.fadeOut(200);
                });
            });
            $('#my_gift #quit_account button.time_cancel').live('click',function(){//提醒消息确认
                var $androidActionSheet = $('#quit_account');
                var $androidMask2 = $androidActionSheet.find('.weui-mask2');
                $androidActionSheet.fadeOut(200);
                $androidMask2.css('display','none');
            })
        });
        $('#my_gift #quit_account4 button.quit_sure').live('click',function(){//提醒消息确认
            $('#quit_account').css('display','none');
            var $androidActionSheet2 = $('#quit_account4');
            var $androidMask2 = $androidActionSheet2.find('.weui-mask4');
            $androidMask2.css('display','none');
            $androidActionSheet2.fadeOut(200);
        });
        $('#my_gift #quit_account4 button.time_cancel').live('click',function(){//提醒消息确认
            var $androidActionSheet = $('#quit_account4');
            var $androidMask2 = $androidActionSheet.find('.weui-mask4');
            $androidActionSheet.fadeOut(200);
            $androidMask2.css('display','none');
        })
        // 头部菜单切换
        $('#my_gift .bar_option').on('click','.flex-1',function(){
            clearTimeout(set_time);
            $('.get_code .remain_time').html('60');//初始化
            if($(this).hasClass('active')){
                $(this).siblings().removeClass('active');
            }else{
                $(this).addClass('active').siblings().removeClass('active');
            }
            if($(this).hasClass('re_phone')){//如果是手机注册
                if($('.phone_input').hasClass('dis-no')){
                    $('.phone_input').removeClass('dis-no');
                    $('.email_input').addClass('dis-no');
                }else{
                    return;
                }
            }else if($(this).hasClass('re_email')){//如果是邮箱注册
                if($('.email_input').hasClass('dis-no')){
                    $('.email_input').removeClass('dis-no');
                    $('.phone_input').addClass('dis-no');
                }else{
                    return;
                }
            }
            $('.password').val("");
            $('.pass_name').val("");
            $('button.get_code_btn.hasinput').removeClass('dis-no');  
            $('.get_code').addClass('dis-no');
        });
        $('.look_for_pass button.get_code_btn.hasinput').live('click',function(){//此处用live因为class为后面动态生成，所以on('click')无效
            var _token = localStorage.getItem('access_token');
            if($('.re_phone').hasClass('active')) {//手机找回
                $.ajax({//手机注册请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "GET",
                    url: weixin_url +'/user/forget-pay-password/sms-code',
                    dataType: "json",
                    success: function(data){
                        if(data.code==0){
                            clearTimeout(set_time);
                            $('.get_code .remain_time').html('60');//初始化
                            $('.get_code_btn').addClass('dis-no'); 
                            $('.get_code').removeClass('dis-no'); 
                            var _Time = 60;
                            function _time(){
                                if (_Time>0){
                                    set_time = setTimeout(function(){
                                        _Time--;
                                        var remain_time = _Time;
                                        $('.get_code .remain_time').html(remain_time);
                                        _time();
                                    },1000);
                                }else{
                                    $('button.get_code_btn.hasinput').removeClass('dis-no');  
                                    $('.get_code').addClass('dis-no');
                                }
                            }
                            _time();
                        }else{
                            $('.error_info').html(data.message);
                            setTimeout(function(){
                                $('.error_info').html('');
                            }, 5000);
                            return;
                        }
                    }
                });
            }else if($('.re_email').hasClass('active')){//邮箱找回
                $.ajax({//邮箱注册请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "GET",
                    url: weixin_url +'/user/forget-pay-password/email-code',
                    dataType: "json",
                    success: function(data){
                        if(data.code !== 0){//事件处理
                            $('.error_info').html(data.message);
                            setTimeout(function(){
                                $('.error_info').html('');
                            }, 5000);
                            return;
                        }else{
                            clearTimeout(set_time);
                            $('.get_code .remain_time').html('60');//初始化
                            $('.get_code_btn').addClass('dis-no'); 
                            $('.get_code').removeClass('dis-no'); 
                            var _Time = 60;
                        
                            function _time(){
                                if (_Time>0){
                                    set_time = setTimeout(function(){
                                        _Time--;
                                        var remain_time = _Time;
                                        $('.get_code .remain_time').html(remain_time);
                                        _time();
                                    },1000);
                                }else{
                                    $('button.get_code_btn.hasinput').removeClass('dis-no');  
                                    $('.get_code').addClass('dis-no');
                                }
                            }
                            _time();
                        }
                    }
                }); 
            }
        });
        $('.look_for_pass .quit_sure').live('click',function(){//忘记密码确认
            var _token = localStorage.getItem('access_token');
            var code = $('.password').val();
            var newPayPassword = $('.pass_name').val();
            if (code.length>0 && newPayPassword.length>0) {
                if($('.re_phone').hasClass('active')) {//手机找回
                    $.ajax({//发起请求
                        headers: {
                            'Authorization': 'bearer '+_token
                        },
                        type: "POST",
                        url:weixin_url + '/user/forget-pay-password/phone/reset',
                        contentType:"application/json",
                        data: JSON.stringify({code:code,newPayPassword:newPayPassword}),
                        success: function(data){
                            if (data.code == 0) {
                                $('#look_info').css('display','block');
                                setTimeout(function(){
                                    $('#look_info').css('display','none');
                                    var $androidActionSheet = $('#quit_account3');
                                    var $androidActionSheet2 = $('#quit_account2');
                                    var $androidMask = $androidActionSheet.find('.weui-mask3');
                                    var $androidMask2 = $androidActionSheet2.find('.weui-mask2');
                                    $androidMask2.css('display','block');
                                    $androidMask.css('display','none');
                                    $androidActionSheet.fadeOut(200);
                                    $androidActionSheet2.fadeIn(200);
                                    $androidMask2.on('click',function () {
                                        $androidMask2.css('display','none');
                                        $androidActionSheet2.fadeOut(200);
                                    });
                                },2000);
                            }else{
                                $('.error_info').html(data.message);
                                setTimeout(function(){
                                    $('.error_info').html('');
                                }, 5000); 
                            }
                            to_login(data);
                        }
                    });
                }else if($('.re_email').hasClass('active')){//邮箱找回
                    $.ajax({//发起请求
                        headers: {
                            'Authorization': 'bearer '+_token
                        },
                        type: "POST",
                        url:weixin_url + '/user/forget-pay-password/email/reset',
                        contentType:"application/json",
                        data: JSON.stringify({code:code,newPayPassword:newPayPassword}),
                        success: function(data){
                            if (data.code == 0) {
                                $('#look_info').css('display','block');
                                setTimeout(function(){
                                    $('#look_info').css('display','none');
                                    var $androidActionSheet = $('#quit_account3');
                                    var $androidActionSheet2 = $('#quit_account2');
                                    var $androidMask = $androidActionSheet.find('.weui-mask3');
                                    var $androidMask2 = $androidActionSheet2.find('.weui-mask2');
                                    $androidMask2.css('display','block');
                                    $androidMask.css('display','none');
                                    $androidActionSheet.fadeOut(200);
                                    $androidActionSheet2.fadeIn(200);
                                    $androidMask2.on('click',function () {
                                        $androidMask2.css('display','none');
                                        $androidActionSheet2.fadeOut(200);
                                    });
                                },2000);
                            }else{
                                $('.error_info').html(data.message);
                                setTimeout(function(){
                                    $('.error_info').html('');
                                }, 5000);
                            }
                            to_login(data);
                        }
                    });
                }
            }
        });
        $('.look_for_pass .time_cancel').live('click',function(){//忘记密码取消
            var $androidActionSheet = $('#quit_account3');
            var $androidActionSheet2 = $('#quit_account2');
            var $androidMask = $androidActionSheet.find('.weui-mask3');
            var $androidMask2 = $androidActionSheet2.find('.weui-mask2');
            $androidMask2.css('display','block');
            $androidMask.css('display','none');
            $androidActionSheet.fadeOut(200);
            $androidActionSheet2.fadeIn(200);
            $androidMask2.on('click',function () {
                $androidMask2.css('display','none');
                $androidActionSheet2.fadeOut(200);
            });
        });
    }else if($('#order_info').size()>0){
        var datas = JSON.parse(localStorage.getItem('order_info'));
        var app = new Vue({
            el: '#order_info',
            data: {
                datas:datas,//初始数据
            },
            methods:{
                pay_sure:function(){
                    var redirect_url1=encodeURI("http://wx.shentingkeji.com/html/pay.html");
                    // 神庭医馆
                    // var _url ='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxe5516c95d26581bf&redirect_uri='+redirect_url1+'&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
                    // 神庭君
                    var _url ='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6e228291e030c062&redirect_uri='+redirect_url1+'&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
                    window.location.href=_url;
                //    window.location.href="./pay.html";
                },
            }
        });
    }else if($('#payfor_order').size()>0){//支付订单页面
        var _token = localStorage.getItem('access_token');
        var datas = JSON.parse(localStorage.getItem('order_info'));
        var app = new Vue({
            el: '#payfor_order',
            data: {
                datas:datas,//初始数据
                coin:[],//
                enogh:[],
            },
            created:function(){
                var that = this;
                var page = 0;
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "GET",
                    url:weixin_url + '/coin/consume-list?page='+page,
                    contentType:"application/json",
                    success: function(data){
                        if (data.code == 0) {
                            that.current = 1;
                            var Data_length =  data.page.content.length;
                            if (Data_length == 0) {
                                that.coin = data.totalCoin;
                                return;
                            }else{//请求到数据
                                that.coin = data.totalCoin;
                                that.enogh = Number(Number(datas.totalPrice)-Number(data.totalCoin)).toFixed(2);
                            }
                        }
                        to_login(data);
                    }
                });
            },
            methods:{
                surepay:function(){//点击确认支付

                    var that = this;
                     // ajax请求的方法
                    var datas = that.datas;
                    var _token = localStorage.getItem('access_token');
                    var orderNum = datas.orderNum;
                    var pay_way = $("input[type='checkbox']:checked").parents('.each_row').find('.thumb span:first-child');
                    var is_joint = pay_way.length;
                    var _totalCoin = Number($('.thumb  span i').html());//总共的神庭币
                    var datas = JSON.parse(localStorage.getItem('order_info'));
                    var totalPrice = datas.totalPrice;
                    
                    if (is_joint == 1) {//单种支付
                        if (pay_way.hasClass('icon-weixinzhifu')) {//如果是微信支付
                            var coinPay ='1';
                            var thirdPay = 'WEIXIN_PAY';
                        }else if (pay_way.hasClass('icon-zhifubaozhifu')){//支付宝支付
                            var coinPay ='1';
                            var thirdPay = 'ALI_PAY';
                        }
                        if(pay_way.hasClass('icon-yue')){//余额支付
                            if (totalPrice<=_totalCoin) {//神庭币够支付
                                // ajax请求的方法
                                var _token = localStorage.getItem('access_token');
                                var that = this;
                                $.ajax({//发起请求,查询是否设置支付密码
                                    headers: {
                                        'Authorization': 'bearer '+_token
                                    },
                                    type: "GET",
                                    url:weixin_url + '/user/pay-password',
                                    contentType:"application/json",
                                    success: function(data){
                                        if (data.code == 0) {
                                            if(data.payPassword){//如果已经设置支付密码
                                                // 弹窗
                                                var $androidActionSheet = $('#quit_account3');
                                                var $androidMask = $androidActionSheet.find('.weui-mask3');
                                                $androidActionSheet.fadeIn(200);
                                                $androidMask.css('display','block');
                                                $androidMask.fadeIn(200);
                                                $androidMask.on('click',function () {
                                                    $androidMask.css('display','none');
                                                    $androidActionSheet.fadeOut(200);
                                                });
                                            }else{//若未设置支付密码
                                                // 弹窗
                                                var $androidActionSheet = $('#quit_account4');
                                                var $androidMask = $androidActionSheet.find('.weui-mask4');
                                                $androidActionSheet.fadeIn(200);
                                                $androidMask.css('display','block');
                                                $androidMask.fadeIn(200);
                                                $androidMask.on('click',function () {
                                                    $androidMask.css('display','none');
                                                    $androidActionSheet.fadeOut(200);
                                                });
                                            }
                                        }
                                        to_login(data);
                                    }
                                });
                                
                            }else{
                                 // 弹窗
                                 var $androidActionSheet = $('#quit_account');
                                 var $androidMask = $androidActionSheet.find('.weui-mask2');
                                 $androidActionSheet.fadeIn(200);
                                 $androidMask.css('display','block');
                                 $('#quit_account .text_info').html('余额不足以单独支付订单，请选择支付宝或者微信支付剩余金额！');
                                 $androidMask.on('click',function () {
                                     $androidMask.css('display','none');
                                     $androidActionSheet.fadeOut(200);
                                 });
                            }
                        }else{//微信单独支付
                            var _url = window.location.href
                            var code = _url.match(/=(\S*)&/)[1];
                            $('.upload_pic.weui-loadmore').css('display','block');
                            $('.surepay_contain').css('display','none');
                            $.ajax({//发起请求
                                headers: {
                                    'Authorization': 'bearer '+_token
                                },
                                type: "POST",
                                url:weixin_url + '/order/pay',
                                contentType:"application/json",
                                data: JSON.stringify({orderNum:orderNum,coinPay:coinPay,thirdPay:thirdPay,code:code}),
                                async:false,
                                success: function(data){
                                    if (data.code == 0) {
                                        var _data = JSON.parse(data.str);
                                        var newOrderNum = data.orderNum;
                                        function onBridgeReady(){
                                            WeixinJSBridge.invoke(
                                               'getBrandWCPayRequest', _data,
                                               function(res){
                                                    $.ajax({//发起请求
                                                        headers: {
                                                            'Authorization': 'bearer '+_token
                                                        },
                                                        type: "GET",
                                                        url:weixin_url + '/order/status/'+newOrderNum,
                                                        contentType:"application/json",
                                                        success: function(data){
                                                        
                                                            to_login(data);
                                                        }
                                                    });
                                                    if(res.err_msg == "get_brand_wcpay_request:ok" ){
                                                        $('.upload_pic.weui-loadmore').css('display','none');
                                                        $('.surepay_contain').css('display','block');
                                                    // 使用以上方式判断前端返回,微信团队郑重提示：
                                                            //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
                                                            window.location.href='../html/pay-success.html';
                                                    }else if(res.err_msg == "get_brand_wcpay_request:cancel"){
                                                            $('.upload_pic.weui-loadmore').css('display','none');
                                                            $('.surepay_contain').css('display','block');
                                                            // 弹窗
                                                            var $androidActionSheet = $('#quit_account2');
                                                            var $androidMask = $androidActionSheet.find('.weui-mask2');
                                                            $androidActionSheet.fadeIn(200);
                                                            $androidMask.css('display','block');
                                                            $('#quit_account2 .text_info').html('支付取消!');
                                                            setTimeout(function(){
                                                                window.location.href='../html/person.html';
                                                            },1000)
                                                    }else if(res.err_msg == "get_brand_wcpay_request:fail"){
                                                            $('.upload_pic.weui-loadmore').css('display','none');
                                                            $('.surepay_contain').css('display','block');
                                                            // 弹窗
                                                            var $androidActionSheet = $('#quit_account2');
                                                            var $androidMask = $androidActionSheet.find('.weui-mask2');
                                                            $androidActionSheet.fadeIn(200);
                                                            $androidMask.css('display','block');
                                                            $('#quit_account2 .text_info').html('支付失败!');
                                                            setTimeout(function(){
                                                                window.location.href='../html/person.html';
                                                            },1000)
                                                    }else{
                                                            return;
                                                    } 
                                                }); 
                                            }
                                            if (typeof WeixinJSBridge == "undefined"){
                                                if( document.addEventListener ){
                                                    document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                                                }else if (document.attachEvent){
                                                    document.attachEvent('WeixinJSBridgeReady', onBridgeReady); 
                                                    document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                                                }
                                            }else{
                                                onBridgeReady();
                                            }
                                        }else{
                                            $('.upload_pic.weui-loadmore').css('display','none');
                                            $('.surepay_contain').css('display','block');
                                            // 弹窗
                                            var $androidActionSheet = $('#quit_account');
                                            var $androidMask = $androidActionSheet.find('.weui-mask2');
                                            $androidActionSheet.fadeIn(200);
                                            $androidMask.css('display','block');
                                            $('#quit_account .text_info').html(data.message);
                                            $androidMask.on('click',function () {
                                                $androidMask.css('display','none');
                                                $androidActionSheet.fadeOut(200);
                                            });
                                        }
                                        to_login(data);
                                }
                            });
                        } 
                    }else if(is_joint == 2){//联合支付
                    var thirdPay = 'WEIXIN_PAY';
                    var coinPay ='0';
                    var _url = window.location.href
                    var code = _url.match(/=(\S*)&/)[1];
                    $('.upload_pic.weui-loadmore').css('display','block');
                    $('.surepay_contain').css('display','none');
                    $.ajax({//发起请求
                        headers: {
                            'Authorization': 'bearer '+_token
                        },
                        type: "POST",
                        url:weixin_url + '/order/pay',
                        contentType:"application/json",
                        data: JSON.stringify({orderNum:orderNum,coinPay:coinPay,thirdPay:thirdPay,code:code}),
                        async:false,
                        success: function(data){
                            if (data.code == 0) {
                                var _data = JSON.parse(data.str);
                                var newOrderNum = data.orderNum;
                                function onBridgeReady(){
                                    WeixinJSBridge.invoke(
                                        'getBrandWCPayRequest', _data,
                                        function(res){
                                            $.ajax({//发起请求
                                                headers: {
                                                    'Authorization': 'bearer '+_token
                                                },
                                                type: "GET",
                                                url:weixin_url + '/order/status/'+newOrderNum,
                                                contentType:"application/json",
                                                success: function(data){
                                                   
                                                    to_login(data);
                                                }
                                            });
                                            $('.upload_pic.weui-loadmore').css('display','none');
                                            $('.surepay_contain').css('display','block');
                                            if(res.err_msg == "get_brand_wcpay_request:ok" ){
                                            // 使用以上方式判断前端返回,微信团队郑重提示：
                                                    //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
                                                    window.location.href='../html/pay-success.html';
                                            }else if(res.err_msg == "get_brand_wcpay_request:cancel"){
                                                // 弹窗
                                                var $androidActionSheet = $('#quit_account2');
                                                var $androidMask = $androidActionSheet.find('.weui-mask2');
                                                $androidActionSheet.fadeIn(200);
                                                $androidMask.css('display','block');
                                                $('#quit_account2 .text_info').html('支付取消!');
                                                setTimeout(function(){
                                                    window.location.href='../html/person.html';
                                                },1000)
                                            }else if(res.err_msg == "get_brand_wcpay_request:fail"){
                                                // 弹窗
                                                var $androidActionSheet = $('#quit_account2');
                                                var $androidMask = $androidActionSheet.find('.weui-mask2');
                                                $androidActionSheet.fadeIn(200);
                                                $androidMask.css('display','block');
                                                $('#quit_account2 .text_info').html('支付失败!');
                                                setTimeout(function(){
                                                    window.location.href='../html/person.html';
                                                },1000)
                                            }else{
                                                return;
                                            } 
                                    }); 
                                }
                                if (typeof WeixinJSBridge == "undefined"){
                                    if( document.addEventListener ){
                                        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                                    }else if (document.attachEvent){
                                        document.attachEvent('WeixinJSBridgeReady', onBridgeReady); 
                                        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                                    }
                                }else{
                                    onBridgeReady();
                                }
                            }else{
                                // 弹窗
                                var $androidActionSheet = $('#quit_account');
                                var $androidMask = $androidActionSheet.find('.weui-mask2');
                                $androidActionSheet.fadeIn(200);
                                $androidMask.css('display','block');
                                $('#quit_account .text_info').html(data.message);
                                $androidMask.on('click',function () {
                                    $androidMask.css('display','none');
                                    $androidActionSheet.fadeOut(200);
                                });
                                $('.upload_pic.weui-loadmore').css('display','none');
                                $('.surepay_contain').css('display','block');
                            }
                            to_login(data);
                        }
                    });
                    }else{//未选中
                        return;
                    }
                 
                },
                balance_pay:function(){//余额支付确认
                    var _content = $('#quit_account3 input').val();
                    var payPassword = _content;
                    var that = this;
                    var coinPay ='0';
                    var thirdPay = '';
                    // ajax请求的方法
                   var datas = that.datas;
                   var _token = localStorage.getItem('access_token');
                   var orderNum = datas.orderNum;
                    if (_content.length == 6) {
                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "POST",
                            url:weixin_url + '/order/pay',
                            contentType:"application/json",
                            data: JSON.stringify({orderNum:orderNum,coinPay:coinPay,thirdPay:thirdPay,payPassword:payPassword}),
                            success: function(data){
                                if (data.code == 0) {
                                    var return_url = "./pay-success.html";
                                    window.location.href=return_url;
                                }else{
                                    // 弹窗
                                    var $androidActionSheet = $('#quit_account');
                                    var $androidActionSheet3 = $('#quit_account3');
                                    var $androidMask = $androidActionSheet.find('.weui-mask2');
                                    var $androidMask3 = $androidActionSheet3.find('.weui-mask3');
                                    $androidActionSheet.fadeIn(200);
                                    $androidActionSheet3.fadeOut(200);
                                    $androidMask.css('display','block');
                                    $androidMask3.css('display','none');
                                    $('#quit_account .text_info').html(data.message);
                                    $androidMask.on('click',function () {
                                        $androidMask.css('display','none');
                                        $androidActionSheet.fadeOut(200);
                                    });
                                    $androidMask3.on('click',function () {
                                        $androidMask3.css('display','none');
                                        $androidActionSheet3.fadeOut(200);
                                    });
                                }
                                to_login(data);
                            }
                        });
                    }else{
                        return;
                    }
                },
                
            }
        });
        // 单选按钮
        $('.payfor_order .each_row').live('click',function(){
            var _totalCoin = Number($('.thumb  span i').html());//总共的神庭币
            var datas = JSON.parse(localStorage.getItem('order_info'));
            var totalPrice = datas.totalPrice;
            var pay_type = $(this).find('.thumb span:first-child');
            if (totalPrice<=_totalCoin && _totalCoin>0){//神庭币够用，只能单选
                $("input[type='checkbox']").prop("checked",false);
                var flag = $(this).find("input[type='checkbox']").is(':checked');
                $(this).find("input[type='checkbox']").prop("checked",!flag);
            }else if (totalPrice > _totalCoin && _totalCoin>0){//神庭币不够用
                var flag = $(this).find("input[type='checkbox']").is(':checked');
                $(this).find("input[type='checkbox']").prop("checked",!flag);
                if (pay_type.hasClass('icon-weixinzhifu')) {//微信支付
                    var ali_pay = $('.icon-zhifubaozhifu').parents('.each_row').find('input').is(':checked');
                    if(ali_pay){//若支付宝已经被选定
                        $(this).find("input[type='checkbox']").prop("checked",false);
                    }
                }else if(pay_type.hasClass('icon-zhifubaozhifu')){//支付宝支付
                    var wei_pay = $('.icon-weixinzhifu').parents('.each_row').find('input').is(':checked');
                    if(wei_pay){//若微信已经被选定
                        $(this).find("input[type='checkbox']").prop("checked",false);
                    }
                }else if(pay_type.hasClass('icon-yue')){//余额支付
                    return;
                }
            }else if(_totalCoin==0){//神庭币为0
                if ($(this).find('.iconfont').hasClass('icon-yue')) {
                    $(this).find("input[type='checkbox']").prop("checked",false);
                }else{
                    $("input[type='checkbox']").prop("checked",false);
                    var flag = $(this).find("input[type='checkbox']").is(':checked');
                    $(this).find("input[type='checkbox']").prop("checked",!flag);
                }
            }else{
                return;
            }
        })
        $('#quit_account button').live('click',function(e){//弹窗
            // 弹窗
            var $androidActionSheet = $('#quit_account');
            var $androidMask = $androidActionSheet.find('.weui-mask2');
            $androidMask.css('display','none');
            $androidActionSheet.fadeOut(200);
        });
        // 弹窗消失
        $('#quit_account3 .time_cancel').live('click',function(){
             // 弹窗
             var $androidActionSheet = $('#quit_account3');
             var $androidMask = $androidActionSheet.find('.weui-mask3');
             $androidMask.css('display','none');
             $androidActionSheet.fadeOut(200);
        })
        $('#payfor_order #quit_account4 .quit_sure').live('click',function(e){//设置交易密码
            // ajax请求的方法
            var _token = localStorage.getItem('access_token');
            var that = this;
            var password = $(this).parents('.weui-actionsheet__menu').find('input').val();
            if(password.length == 6){
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "POST",
                    url:weixin_url + '/user/pay-password',
                    contentType:"application/json",
                    data: JSON.stringify({payPassword:password}),
                    success: function(data){
                        if (data.code == 0) {
                            $('#regist_info').css('display','block');
                            setTimeout(function(){
                                $('#regist_info').css('display','none');
                            },2000);
                             // 弹窗
                             var $androidActionSheet = $('#quit_account3');
                             var $androidActionSheet2 = $('#quit_account4');
                             var $androidMask = $androidActionSheet.find('.weui-mask3');
                             var $androidMask2 = $androidActionSheet2.find('.weui-mask4');
                             $androidActionSheet.fadeIn(200);
                             $androidActionSheet2.fadeOut(200);
                             $androidMask.css('display','block');
                             $androidMask2.css('display','none');
                             $androidMask.fadeIn(200);
                             $androidMask2.fadeOut(200);
                             $androidMask.on('click',function () {
                                 $androidMask.css('display','none');
                                 $androidActionSheet.fadeOut(200);
                             });
                        }
                        to_login(data);
                    }
                });
            }else{
                $('#payfor_order .input_error').removeClass('dis-no');
                $('#payfor_order .input_error').html('密码格式错误！');
                setTimeout(function(){
                    $('#payfor_order .input_error').addClass('dis-no');
                    $('#payfor_order .input_error').html(''); 
                },1000)
            }
        });
        $('#payfor_order #quit_account4 .time_cancel').live('click',function(e){//设置交易密码
            var $androidActionSheet = $('#quit_account4');
            var $androidMask = $androidActionSheet.find('.weui-mask4');
            $androidActionSheet.fadeOut(200);
            $androidMask.css('display','none');
        });
    }else if($('.forget-pay.forget_pass').size()>0){//找回支付密码和登录密码/修改登录密码和支付密码
            // 页面请求发ajax
            var _token = localStorage.getItem('access_token');
            if ($('#forget-pay').size()>0) {//找回支付密码
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: 'GET',
                    url:weixin_url + '/user/user-info',
                    contentType:"application/json",
                    success: function(data){
                        if (data.code == 0) {
                            var email = data.userInfo.email;
                            var phone = data.userInfo.phone;
                            if(email.length>0 && phone.length==0){//只有邮箱
                                $('.re_phone').addClass('dis-no');
                                $('.re_phone').removeClass('active');
                                $('.re_email').addClass('active');
                                $('.email_input').html(email);
                                $('.phone_input').addClass('dis-no');
                            }else if(email.length==0 && phone.length>0){//只有电话
                                $('.re_email').addClass('dis-no');
                                $('.re_email').removeClass('active');
                                $('.re_phone').addClass('active');
                                $('.phone_input').html(phone);
                                $('.email_input').addClass('dis-no');
                            }else{
                                $('.email_input').html(email);
                                $('.phone_input').html(phone);
                                $('.email_input').addClass('dis-no');
                                $('.re_phone').addClass('active');
                                $('.re_email').removeClass('active');
                            }
                        }else{
    
                        }
                        to_login(data);
                    }
                });
            }else if($('#forget-login').size()>0){//找回登录密码
                // 输入手机号，获取验证码变化
                $('#forget-login .input_row input.re_input').on('keyup',function(){
                    var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;//邮箱格式验证
                    var reg2 = /^[1][3,4,5,7,8][0-9]{9}$/;//手机号码正则
                    var _val = $('.email_input').val();
                    var _val2 = $('.phone_input').val();
                    var obj = reg.test(_val);
                    var obj2 = reg2.test(_val2);
                    if(obj2 == true && $(this).hasClass('phone_input')){//手机注册
                        $('.get_code_btn').addClass('hasinput');
                    }else if(obj == true && $(this).hasClass('email_input')){
                        $('.get_code_btn').addClass('hasinput');
                    }else{
                        $('.get_code_btn').removeClass('hasinput');
                    }
                });
            }            
           // 头部菜单切换
           $('.forget-pay .bar_option').on('click','.flex-1',function(){
            var set_time;
            clearTimeout(set_time);
            $('.get_code .remain_time').html('60');//初始化
            if($(this).hasClass('active')){
                $(this).siblings().removeClass('active');
            }else{
                $(this).addClass('active').siblings().removeClass('active');
            }
            if($(this).hasClass('re_phone')){//如果是手机注册
                if($('.phone_input').hasClass('dis-no')){
                    $('.phone_input').removeClass('dis-no');
                    $('.email_input').addClass('dis-no');
                }else{
                    return;
                }
            }else if($(this).hasClass('re_email')){//如果是邮箱注册
                if($('.email_input').hasClass('dis-no')){
                    $('.email_input').removeClass('dis-no');
                    $('.phone_input').addClass('dis-no');
                }else{
                    return;
                }
            }
            $('.password').val("");
            $('.pass_name').val("");
            $('button.get_code_btn.hasinput').removeClass('dis-no');  
            $('.get_code').addClass('dis-no');
        });
        // 获取验证码
        $('.forget-pay button.get_code_btn.hasinput').live('click',function(){//此处用live因为class为后面动态生成，所以on('click')无效
            var _token = localStorage.getItem('access_token');
            if($('.re_phone').hasClass('active')) {//手机找回
                if($('#forget-login').size()>0){//忘记登录密码
                    var _phone = $('.phone_input').val();
                    $.ajax({//手机注册请求
                        type: "GET",
                        url: medicine_url +'/v1.0.0/signup/forget-password/getSmsCode/'+_phone,
                        dataType: "json",
                        success: function(data){
                            if(data.code==0){
                                clearTimeout(set_time);
                                $('.get_code .remain_time').html('60');//初始化
                                $('.get_code_btn').addClass('dis-no'); 
                                $('.get_code').removeClass('dis-no'); 
                                var _Time = 60;
                                function _time(){
                                    if (_Time>0){
                                        set_time = setTimeout(function(){
                                            _Time--;
                                            var remain_time = _Time;
                                            $('.get_code .remain_time').html(remain_time);
                                            _time();
                                        },1000);
                                    }else{
                                        $('button.get_code_btn.hasinput').removeClass('dis-no');  
                                        $('.get_code').addClass('dis-no');
                                    }
                                }
                                _time();
                            }else{
                                $('.error_info').html(data.message);
                                setTimeout(function(){
                                    $('.error_info').html('');
                                    // to_login(data);
                                }, 5000);
                                return;
                            }
                        }
                    });
                }else if ($('#forget-pay').size()>0){//忘记支付密码
                    $.ajax({//手机注册请求
                        headers: {
                            'Authorization': 'bearer '+_token
                        },
                        type: "GET",
                        url: weixin_url +'/user/forget-pay-password/sms-code',
                        dataType: "json",
                        success: function(data){
                            if(data.code==0){
                                clearTimeout(set_time);
                                $('.get_code .remain_time').html('60');//初始化
                                $('.get_code_btn').addClass('dis-no'); 
                                $('.get_code').removeClass('dis-no'); 
                                var _Time = 60;
                                function _time(){
                                    if (_Time>0){
                                        set_time = setTimeout(function(){
                                            _Time--;
                                            var remain_time = _Time;
                                            $('.get_code .remain_time').html(remain_time);
                                            _time();
                                        },1000);
                                    }else{
                                        $('button.get_code_btn.hasinput').removeClass('dis-no');  
                                        $('.get_code').addClass('dis-no');
                                    }
                                }
                                _time();
                            }else{
                                $('.error_info').html(data.message);
                                setTimeout(function(){
                                    $('.error_info').html('');
                                    to_login(data);
                                }, 5000);
                                return;
                            }
                        }
                    });
                }
                
            }else if($('.re_email').hasClass('active')){//邮箱找回
                if($('#forget-login').size()>0){//忘记登录密码
                    var _email = $('.email_input').val();
                    $.ajax({//邮箱注册请求
                        type: "GET",
                        url: medicine_url +'/v1.0.0/signup/forget-password/getSmsCode/'+_email,
                        dataType: "json",
                        success: function(data){
                            if(data.code !== 0){//事件处理
                                $('.error_info').html(data.message);
                                setTimeout(function(){
                                    $('.error_info').html('');
                                    to_login(data);
                                }, 5000);
                                return;
                            }else{
                                clearTimeout(set_time);
                                $('.get_code .remain_time').html('60');//初始化
                                $('.get_code_btn').addClass('dis-no'); 
                                $('.get_code').removeClass('dis-no'); 
                                var _Time = 60;
                            
                                function _time(){
                                    if (_Time>0){
                                        set_time = setTimeout(function(){
                                            _Time--;
                                            var remain_time = _Time;
                                            $('.get_code .remain_time').html(remain_time);
                                            _time();
                                        },1000);
                                    }else{
                                        $('button.get_code_btn.hasinput').removeClass('dis-no');  
                                        $('.get_code').addClass('dis-no');
                                    }
                                }
                                _time();
                            }
                        }
                    }); 
                }else if ($('#forget-pay').size()>0){//忘记支付密码
                    $.ajax({//邮箱注册请求
                        headers: {
                            'Authorization': 'bearer '+_token
                        },
                        type: "GET",
                        url: weixin_url +'/user/forget-pay-password/email-code',
                        dataType: "json",
                        success: function(data){
                            if(data.code !== 0){//事件处理
                                $('.error_info').html(data.message);
                                setTimeout(function(){
                                    $('.error_info').html('');
                                    to_login(data);
                                }, 5000);
                                return;
                            }else{
                                clearTimeout(set_time);
                                $('.get_code .remain_time').html('60');//初始化
                                $('.get_code_btn').addClass('dis-no'); 
                                $('.get_code').removeClass('dis-no'); 
                                var _Time = 60;
                            
                                function _time(){
                                    if (_Time>0){
                                        set_time = setTimeout(function(){
                                            _Time--;
                                            var remain_time = _Time;
                                            $('.get_code .remain_time').html(remain_time);
                                            _time();
                                        },1000);
                                    }else{
                                        $('button.get_code_btn.hasinput').removeClass('dis-no');  
                                        $('.get_code').addClass('dis-no');
                                    }
                                }
                                _time();
                            }
                        }
                    }); 
                }
            }
        });
        $('.forget-pay .forget_menu .quit_sure').live('click',function(){//忘记密码确认
            var _token = localStorage.getItem('access_token');
            var code = $('.password').val();
            var newPayPassword = $('.pass_name').val();
            if (code.length>0 && newPayPassword.length>0) {
                if($('.re_phone').hasClass('active')) {//手机找回
                    if($('#forget-login').size()>0){//忘记登录密码
                        var _phone = $('.phone_input').val();
                        $.ajax({//发起请求
                            type: "PUT",
                            url:medicine_url + '/v1.0.0/signup/forget-password',
                            contentType:"application/json",
                            data: JSON.stringify({phone:_phone,smsCode:code,newPassword:newPayPassword}),
                            success: function(data){
                                if (data.code == 0) {
                                    $('#look_info').css('display','block');
                                    setTimeout(function(){
                                        $('#look_info').css('display','none');
                                        window.location.href="../html/login.html";
                                    },2000);
                                }else{
                                    $('.error_info').html(data.message);
                                    setTimeout(function(){
                                        $('.error_info').html('');
                                    }, 5000); 
                                }
                                to_login(data);
                            }
                        });
                    }else if ($('#forget-pay').size()>0){//忘记支付密码
                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "POST",
                            url:weixin_url + '/user/forget-pay-password/phone/reset',
                            contentType:"application/json",
                            data: JSON.stringify({code:code,newPayPassword:newPayPassword}),
                            success: function(data){
                                if (data.code == 0) {
                                    $('#look_info').css('display','block');
                                    setTimeout(function(){
                                        $('#look_info').css('display','none');
                                        window.location.href="../html/person.html";
                                    },2000);
                                }else{
                                    $('.error_info').html(data.message);
                                    setTimeout(function(){
                                        $('.error_info').html('');
                                    }, 5000); 
                                }
                                to_login(data);
                            }
                        });
                    }  
                   
                }else if($('.re_email').hasClass('active')){//邮箱找回
                    if($('#forget-login').size()>0){//忘记登录密码
                        var _email = $('.email_input').val();
                        $.ajax({//发起请求
                            type: "PUT",
                            url:medicine_url + '/v1.0.0/signup/forget-password',
                            contentType:"application/json",
                            data: JSON.stringify({phone:_email,smsCode:code,newPassword:newPayPassword}),
                            success: function(data){
                                if (data.code == 0) {
                                    $('#look_info').css('display','block');
                                    setTimeout(function(){
                                        $('#look_info').css('display','none');
                                        window.location.href="../html/login.html";
                                    },2000);
                                }else{
                                    $('.error_info').html(data.message);
                                    setTimeout(function(){
                                        $('.error_info').html('');
                                    }, 5000); 
                                }
                                to_login(data);
                            }
                        });
                    }else if ($('#forget-pay').size()>0){//忘记支付密码
                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "POST",
                            url:weixin_url + '/user/forget-pay-password/email/reset',
                            contentType:"application/json",
                            data: JSON.stringify({code:code,newPayPassword:newPayPassword}),
                            success: function(data){
                                if (data.code == 0) {
                                    $('#look_info').css('display','block');
                                    setTimeout(function(){
                                        $('#look_info').css('display','none');
                                        window.location.href="../html/person.html";
                                    },2000);
                                }else{
                                    $('.error_info').html(data.message);
                                    setTimeout(function(){
                                        $('.error_info').html('');
                                    }, 5000);
                                }
                                to_login(data);
                            }
                        });
                    } 
                }
            }
        });
    }else if($('.change-pass').size()>0){//修改登录/支付密码
        // 页面请求发ajax
        var _token = localStorage.getItem('access_token');
        if($('#change-login').size()>0){//修改登录
            $.ajax({//发起请求
                headers: {
                    'Authorization': 'bearer '+_token
                },
                type: 'GET',
                url:weixin_url + '/user/user-info',
                contentType:"application/json",
                success: function(data){
                    if (data.code == 0) {
                        var email = data.userInfo.email;
                        var phone = data.userInfo.phone;
                        if(email.length>0 && phone.length==0){//只有邮箱
                            $('.my_email').removeClass('dis-no');
                            $('.my_email').html(email);
                        }else if(email.length==0 && phone.length>0){//只有电话
                            $('.my_phone').removeClass('dis-no');
                            $('.my_phone').html(phone);
                        }else{
                            $('.my_phone').removeClass('dis-no');
                            $('.my_phone').html(phone);
                        }
                    }else{

                    }
                    to_login(data);
                }
            });
        }
        $('.change-pass .quit_sure').live('click',function(){
            if($('#change-login').size()>0){//修改登录
                var oldPassword = $('.ori_pass').val();
                var newPassword = $('.new_pass').val();
                var once_pass = $('.once_pass').val();
                var _url = medicine_url +'/v1.0.0/modification-password';
                if (oldPassword.length>0 && newPassword.length>0 && once_pass.length>0 && once_pass== newPassword) {
                    $.ajax({//发起请求
                        headers: {
                            'Authorization': 'bearer '+_token
                        },
                        type: 'PUT',
                        url:_url,
                        contentType:"application/json",
                        data: JSON.stringify({oldPassword:oldPassword,newPassword:newPassword}),
                        success: function(data){
                            if (data.code == 0) {
                                $('#look_info').css('display','block');
                                setTimeout(function(){
                                    $('#look_info').css('display','none');
                                    window.location.href="../html/login.html";
                                },2000);
                            }else{
                                $('.error_info').html(data.message);
                                setTimeout(function(){
                                    $('.error_info').html('');
                                }, 5000); 
                            }
                            to_login(data);
                        }
                    });
                }
            }else if($('#change-pay').size()>0){//修改支付
                var oldPayPassword = $('.ori_pass').val();
                var newPayPassword = $('.new_pass').val();
                var once_pass = $('.once_pass').val();
                var _url = weixin_url +'/user/modify-pay-password';
                if (oldPayPassword.length>0 && newPayPassword.length>0 && once_pass.length>0 && once_pass== newPayPassword) {
                    $.ajax({//发起请求
                        headers: {
                            'Authorization': 'bearer '+_token
                        },
                        type: 'POST',
                        url:_url,
                        contentType:"application/json",
                        data: JSON.stringify({oldPayPassword:oldPayPassword,newPayPassword:newPayPassword}),
                        success: function(data){
                            if (data.code == 0) {
                                $('#look_info').css('display','block');
                                setTimeout(function(){
                                    $('#look_info').css('display','none');
                                    window.location.href="../html/person.html";
                                },2000);
                            }else{
                                $('.error_info').html(data.message);
                                setTimeout(function(){
                                    $('.error_info').html('');
                                }, 5000); 
                            }
                            to_login(data);
                        }
                    });
                }
            }
        })
    }else if($('#welfare').size()>0){//神庭公益主页面
        var _token = localStorage.getItem('access_token');
        var _url = weixin_url+'/public-benefit/aidedQualification';
        var app = new Vue({
            el: '#welfare',
            data: {
                loading:true,
                showpage:false,
                can_apply:true,
                datas:[],//初始数据
                error_messege:[],//错误提示
            },
            created:function(){
                var that = this;
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: 'GET',
                    url:_url,
                    contentType:"application/json",
                    success: function(data){
                        that.loading = false;
                        that.showpage = true;
                        if (data.code !== 0) {
                            that.can_apply = false;
                            that.error_messege = data.message;
                        }else{
                            that.can_apply = true;
                        }
                        to_login(data);
                    }
                });
            },
            methods:{
                apply_fund:function(event){
                    var that = this;
                    if ($('.appli_home').hasClass('can_apply')) {
                        window.location.href="../html/application_home1.html";
                    }else{
                        var _content = that.error_messege;
                        $('.error_info').html(_content);
                        $('.error_info').css('display','block');
                        setTimeout(function(){
                            $('.error_info').html('');
                            $('.error_info').css('display','none');
                        }, 5000); 
                    }
                }
            }
        });
    }else if($('#welfare_home1').size()>0){//神庭公益资助申请页面1
        var _token = localStorage.getItem('access_token');
        var app = new Vue({
            el: '#welfare_home1',
            data: {
                loading:true,
                show_modal:true,
                showpage:false,
                aidApply:[],//传给后台的数据
                user_info:[],//初始化用户数据
                city_info:[],//城市信息,汇总
                city_name:[],//市级
                area_name:[],//地区级
                is_three:false,//标记是否三层
                is_select_last:false,//标记是否选择最后一层
                province:{name:"",id:""},
                city:{name:"",id:""},
                area:{name:"",id:""},
            },
            created:function(){
                var that = this;
                $.ajax({//发起请求//请求地址信息
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: 'GET',
                    url:'https://wap.shentingkeji.com/stassistant/plugins/city/cityJson.json',
                    contentType:"application/json",
                    success: function(data){
                        if (data.code == 0) {
                            that.city_info = data.list;
                            $.ajax({//发起请求//获取已保存信息
                                headers: {
                                    'Authorization': 'bearer '+_token
                                },
                                type: 'POST',
                                url:weixin_url+'/public-benefit/addAidApply',
                                contentType:"application/json",
                                success: function(data){
                                    if (data.code == 0) {
                                        that.user_info = data.aidApply;
                                        that.aidApply = data.aidApply;
                                        if (data.aidApply.apartment!==null && data.aidApply.apartment.seqCn!==undefined){
                                            // 先渲染省级
                                            var _province_arr = that.city_info;
                                            var province_content = "<option value='-1' id='p_select1'>请选择</option>";
                                            for(var i = 0;i<_province_arr.length;i++){
                                                province_content+="<option value='"+_province_arr[i].dictName+"' id='"+_province_arr[i].id+"'>"+_province_arr[i].dictName+"</option>";
                                            }
                                            $('#city_province').html(province_content);

                                            // 再修改页面内容
                                            var _city = data.aidApply.apartment.seqCn.split('-');
                                            var _city_id = data.aidApply.apartment.seqNo.split('.');
                                            that.province.id = _city_id[0];
                                            that.city.id = _city_id[1];
                                            that.area.id = _city_id[2];
                                            that.province.name = _city[0];
                                            that.city.name = _city[1];
                                            that.area.name = _city[2];
                                            
                                            if (_city.length==2){//不显示区级
                                                var _city_info = that.city_info;
                                                for (var i = 0;i <_city_info.length;i++){//查找省的相同id
                                                    if (_city_info[i].id==that.province.id){
                                                        that.city_name =_city_info[i].children;
                                                        $('#city_province').val(that.province.name);
                                                        var city_arry = that.city_name;
                                                        var city_content = "<option value='-1' id='p_select2'>请选择</option>";
                                                        for(var j=0;j<city_arry.length;j++){
                                                            city_content+="<option value='"+city_arry[j].dictName+"' id='"+city_arry[j].id+"'>"+city_arry[j].dictName+"</option>";
                                                            if (city_arry[j].id==that.city.id) {//查找市的相同id
                                                                city_content+="<option selected value='"+city_arry[j].dictName+"' id='"+city_arry[j].id+"'>"+city_arry[j].dictName+"</option>";
                                                            }
                                                            $('#city_name').html(city_content);
                                                        }
                                                    }
                                                }
                                            }else if(_city.length==3){//显示区级,包括直辖市
                                                var _city_info = that.city_info;
                                                $('.area_name').removeClass('dis-no');
                                                for (var i = 0;i <_city_info.length;i++){//查找省的相同id
                                                    if (_city_info[i].id==that.province.id){
                                                        that.city_name =_city_info[i].children;
                                                        $('#city_province').val(that.province.name);
                                                        var city_arry = that.city_name;
                                                        var city_content = "<option value='-1' id='p_select2'>请选择</option>";
                                                        for(var j=0;j<city_arry.length;j++){
                                                            
                                                            if (city_arry[j].id==that.city.id) {//查找市的相同id
                                                                city_content+="<option selected value='"+city_arry[j].dictName+"' id='"+city_arry[j].id+"'>"+city_arry[j].dictName+"</option>";
                                                                that.area_name =city_arry[j].children;
                                                                var area_arry = that.area_name;
                                                                var area_content = "<option value='-1' id='p_select3'>请选择</option>";
                                                                for(var k=0;k<area_arry.length;k++){
                                                                    area_content+="<option value='"+area_arry[k].dictName+"' id='"+area_arry[k].id+"'>"+area_arry[k].dictName+"</option>";
                                                                    $('#area_name').html(area_content);
                                                                    if (area_arry[k].id==that.area.id) {
                                                                        area_content+="<option selected value='"+area_arry[k].dictName+"' id='"+area_arry[k].id+"'>"+area_arry[k].dictName+"</option>";
                                                                    }
                                                                }
                                                            }else {
                                                                city_content+="<option value='"+city_arry[j].dictName+"' id='"+city_arry[j].id+"'>"+city_arry[j].dictName+"</option>";
                                                                
                                                            }
                                                            $('#city_name').html(city_content);
                                                        }
                                                    }
                                                }
                                            }
                                        }else{
                                            var _province_arr = that.city_info;
                                            var province_content = "<option value='-1' id='p_select1'>请选择</option>";
                                            for(var i = 0;i<_province_arr.length;i++){
                                                province_content+="<option value='"+_province_arr[i].dictName+"' id='"+_province_arr[i].id+"'>"+_province_arr[i].dictName+"</option>";
                                            }
                                            var city_content = "<option value='-1' id='p_select2'>请选择</option>";
                                            $('#city_province').html(province_content);
                                            $('#city_name').html(city_content);
                                        }
                                    }else if(data.code == 1){
                                        window.location.href='./person.html';
                                    }else{
                                        return;
                                    }
                                    to_login(data);
                                }
                            });
                        }else{
                            return;
                        }
                        to_login(data);
                    }
                });
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: 'GET',
                    url:weixin_url+'/agreement/confirm/agreement_type_benefit_apply',
                    contentType:"application/json",
                    success: function(data){
                        that.loading = false;
                        that.showpage = true;
                        if (data.code == 0) {
                            that.show_modal = !data.confirm;
                        }else{
                            return;
                        }
                        to_login(data);
                    }
                });
            },
            methods:{
                agree_info:function(event){
                    var that = this;
                    var is_agree = $('.welcome_page').find('.weui-agree__checkbox').prop('checked');
                    if (is_agree) {//如果同意
                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "POST",
                            url:weixin_url+'/agreement/confirm/agreement_type_benefit_apply',
                            contentType:"application/json",
                            success: function(data){
                                if (data.code == 0) {
                                    that.show_modal = false;
                                }
                                to_login(data);
                            }
                        });
                    }else{
                        that.show_modal = true; 
                        return;       
                    }
                },
                selectVal:function(e){
                    var that = this;
                    var myselect=document.getElementById("city_province");
                    var _index=myselect.selectedIndex - 1;
                    if (_index == -1) {
                        $('.city_name').addClass('dis-no');
                        $('.city_name select').val('请选择');
                        $('.area_name').addClass('dis-no');
                        $('.area_name select').val('请选择');
                        return;
                    }else{
                        var city_info = that.city_info;
                        var city_length = city_info[_index].children.length;
                        $('.city_name').removeClass('dis-no');
                        $('.city_name select').val('请选择');
                        $('.area_name').addClass('dis-no');
                        $('.area_name select').val('请选择');
                        if (city_length == 1) {//若为直辖市或者港澳台
                            is_urisdiction = city_info[_index].children[0].children;
                            if (is_urisdiction !== undefined){//直辖市
                                that.city_name=city_info[_index].children;
                            }else{//港澳台和其他
                                that.city_name=city_info[_index].children;
                            }
                        }else{//若非直辖市
                            that.city_name=city_info[_index].children;
                        }
                        var _city_arr = that.city_name;
                        var city_content = "<option value='-1' id='p_select2'>请选择</option>";
                        for(var i = 0;i<_city_arr.length;i++){
                            city_content+="<option value='"+_city_arr[i].dictName+"' id='"+_city_arr[i].id+"'>"+_city_arr[i].dictName+"</option>";
                        }
                        $('#city_name').html(city_content);
                        that.is_three = false;
                        that.is_select_last = false;
                    }
                },
                selectVal2:function(){
                    var that = this;
                    var myselect=document.getElementById("city_name");
                    var _index=myselect.selectedIndex - 1;
                    if (_index == -1) {
                        $('.area_name').addClass('dis-no');
                        $('.area_name select').val('请选择');
                        return;
                    }else{
                        var city_name = that.city_name;
                        that.area_name=city_name[_index].children;
                        var _area_arr = that.area_name;
                        var area_content = "<option value='-1' id='p_select3'>请选择</option>";
                        if (_area_arr!==undefined) {//有三个层级
                            for(var i = 0;i<_area_arr.length;i++){
                                area_content+="<option value='"+_area_arr[i].dictName+"' id='"+_area_arr[i].id+"'>"+_area_arr[i].dictName+"</option>";
                            }
                        }else{//有两个层级
                            return;
                        }
                        $('#area_name').html(area_content);
                        if (city_name[_index].children !== undefined) {//普通省市
                            $('.area_name').removeClass('dis-no');
                            that.is_three = true;
                        }else{//直辖市和港澳台等
                            $('.area_name').addClass('dis-no'); 
                            that.is_three = false;                       
                        }
                    }
                },
                selectVal3:function(){
                    var that = this;
                    var myselect=document.getElementById("area_name");
                    var _index=myselect.selectedIndex - 1;
                    if (_index == -1) {
                        return;
                    }else{
                        that.is_select_last = true;//选完最后一级
                    }
                },
                jion_modal:function(){
                    var that = this;
                    that.show_modal = true;
                },
                next_step:function(){
                    var that = this;
                    var _token = localStorage.getItem('access_token');
                    var members = $('.members').val();//家庭人口
                    var maritalStatus = $('.maritalStatus').val();//婚姻状况
                    var workDesc = $('.workDesc').val();//工作情况
                    var income = $('.income').val();//个人年收入
                    var city_province=document.getElementById('city_province');
                    var index=city_province.selectedIndex ; // selectedIndex代表的是你所选中项的index
                    var p_select = city_province.options[index].id;//省份id
                    var city_name=document.getElementById('city_name');
                    var index=city_name.selectedIndex ;
                    var c_select = city_name.options[index].id;//城市id
                    var area_name=document.getElementById('area_name');
                    var index=area_name.selectedIndex ;
                    if(area_name.options[index]==undefined){
                        var a_select = 'p_select3';
                    }else{
                        var a_select = area_name.options[index].id;//地区id
                    }
                    if (p_select !== 'p_select1' && c_select == 'p_select2' && a_select == 'p_select3') {//只选了一个级别
                        $('.error_info').removeClass('dis-no');
                        setTimeout(function(){
                            $('.error_info').addClass('dis-no');
                        }, 3000); 
                    }else if(p_select !== 'p_select1' && c_select !== 'p_select2' && a_select == 'p_select3'){//只选了两个级别
                        var is_three = that.is_three;
                        var is_select_last = that.is_select_last;
                        if (is_three == false) {//只有两级
                            var _id = c_select;
                            var apartment = _id;
                        }else if(is_three && is_select_last == false){
                            $('.error_info').removeClass('dis-no');
                            setTimeout(function(){
                                $('.error_info').addClass('dis-no');
                            }, 3000); 
                        } 
                    }else if(p_select !== 'p_select1' && c_select !== 'p_select2' && a_select !== 'p_select3'){//三个级别
                        var _id = a_select;
                        var apartment = _id;
                    }else{//一个未选
                        $('.error_info').removeClass('dis-no');
                        setTimeout(function(){
                            $('.error_info').addClass('dis-no');
                        }, 3000); 
                    }
                    if(members!=='0' && maritalStatus!=='0' && workDesc!== '0' && income!=='0' && apartment!==undefined){
                        var aidApply = that.aidApply;
                        var apartment1 = {};
                        apartment1.id = apartment;
                        aidApply.members=members;
                        aidApply.maritalStatus=maritalStatus;
                        aidApply.workDesc=workDesc;
                        aidApply.income=income;
                        aidApply.apartment=apartment1;
                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: 'POST',
                            url:weixin_url+'/public-benefit/saveAidApply',
                            contentType:"application/json",
                            data: JSON.stringify({aidApply}),
                            dataType: "json",
                            success: function(data){
                                if (data.code == 0) {
                                    window.location.href="../html/application_home2.html";
                                }else{
                                    return;
                                }
                                to_login(data);
                            }
                        });
                    }else{
                        $('.error_info2').removeClass('dis-no');
                        setTimeout(function(){
                            $('.error_info2').addClass('dis-no');
                        }, 3000);  
                    }
                }
            }
        });
    }else if($('#welfare_home2').size()>0){//申请资助第二页
        var _token = localStorage.getItem('access_token');
        var app = new Vue({
            el: '#welfare_home2',
            data: {
                loading:true,
                showpage:false,
                aidApply:[],//传给后台的数据
                user_info:[],//初始化用户数据
                pics:[],//图片信息
                resourceIds:[],//图片id
            },
            created:function(){
                var that = this;
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: 'POST',
                    url:weixin_url+'/public-benefit/addAidApply',
                    contentType:"application/json",
                    success: function(data){
                        that.loading = false;
                        that.showpage = true;
                        if (data.code == 0) {
                            that.user_info = data.aidApply;
                            that.aidApply = data.aidApply;
                            // 图片上传插件启动
                            mui.init();
                            $(function() {
                                var tmpl = '<li class="weui-uploader__file" style="background-image:url(#url#)"></li>',
                                    $gallery = $("#gallery"),
                                    $galleryImg = $("#galleryImg"),
                                    $uploaderInput = $("#uploaderInput"),
                                    $uploaderFiles = $("#uploaderFiles");
                                var _ids = data.resourceRelations;
                                for (var i=0;i<_ids.length;i++){
                                    that.resourceIds.push(_ids[i].resource.id);
                                }
                                    $uploaderInput.on("change", function(e) {
                                        var src, url = window.URL || window.webkitURL || window.mozURL,
                                        files = e.target.files;
                                        var fileLimitSize = 1024 * 1024 * 5;
                                        for(var i = 0, len = files.length; i < len; ++i) {
                                            var file = files[i];
                                            if(file.size > fileLimitSize){
					                    		alert("图片过大，请重新上传");
					                    		return;
					                        }
                                            if(url) {
                                                src = url.createObjectURL(file);
                                            } else {
                                                src = e.target.result;
                                            }
                                            that.pics.push(file);
                                            $uploaderFiles.append($(tmpl.replace('#url#', src)));

                                        }
                                    });
                                var index; //第几张图片
                                $uploaderFiles.on("click", "li", function() {
                                    index = $(this).index();
                                    $galleryImg.attr("style", this.getAttribute("style"));
                                    $gallery.fadeIn(100);
                                });
                                $gallery.on("click", function() {
                                    $gallery.fadeOut(100);
                                });
                                //删除图片
                                $(".weui-gallery__del").click(function() {
                                    $uploaderFiles.find("li").eq(index).remove();
                                    var _pic = that.pics;
                                    _pic.splice(index,1);
                                    that.pics = _pic;
                                    that.resourceIds.splice(index,1);
                                });
                                // 若有数据，页面初始化渲染
                                var _pic = data.resourceRelations;
                                if (_pic!==undefined) {
                                    var _content = "";
                                    for (var i=0;i<_pic.length;i++){
                                        _content +="<li class='weui-uploader__file' style='background-image:url("+_pic[i].resource.path+"')></li>";
                                    }
                                    $('#uploaderFiles').html(_content);
                                }
                            });
                        }else if(data.code == 1){
                            window.location.href='./person.html';
                        }else{
                            return;
                        }
                        to_login(data);
                    }
                });
            },
            methods:{
                next_step:function(){
                    var that = this;
                    var diagnosis = $('div.diagnosis textarea').val();
                    var illnessDegree = $('select.illnessDegree').val();
                    var resourceIds = $('div.resourceIds .weui-uploader__files li');
                    if (diagnosis.length==0) {
                        $('p.diagnosis').removeClass('dis-no');
                        setTimeout(function(){
                            $('p.diagnosis').addClass('dis-no');
                        }, 3000);
                    }
                    if(illnessDegree=='0'){
                        $('p.illnessDegree').removeClass('dis-no');
                        setTimeout(function(){
                            $('p.illnessDegree').addClass('dis-no');
                        }, 3000);
                    }
                    if(resourceIds.length==0){
                        $('p.resourceIds').removeClass('dis-no');
                        setTimeout(function(){
                            $('p.resourceIds').addClass('dis-no');
                        }, 3000);
                    }
                    if (diagnosis.length !==0 && illnessDegree !=='0' && resourceIds.length !==0) {
                        //上传图片
                        var file = that.pics;
                        $('.upload_pic.weui-loadmore').css('display','block');
                        for(var i=0;i<file.length;i++){
                            var signData = {};
                            signData.type = "coinAid";
                            signData.source = "assistant_user";
                            signData.fileName = file[i].name;
                            var j = i;
                            $.ajax({//发起请求
                                headers: {
                                    'Authorization': 'bearer '+_token
                                },
                                type: 'POST',
                                url:assistant_url+'/assistant/file/uploadImg',
                                contentType:"application/json",
                                data: JSON.stringify(signData),
                                async:false,
                                dataType:'json',
                                success: function(data){
                                    var data = data.obj;
                                    var _id = data.id;
                                    that.resourceIds.push(_id);
                                    var formData = new FormData();
                                    formData.append("key", data.objectKey);
                                    formData.append("success_action_status", 200);
                                    formData.append("OSSAccessKeyId", data.accessKey);
                                    formData.append("policy", data.policy);
                                    formData.append("Signature", data.signature);
                                    formData.append("file", file[j], file[j].name);
                                    var req = new XMLHttpRequest();
                                    req.open("POST", data.host, false);
                                    req.send(formData);
                                }
                            });
                        }
                        var aidApply = that.aidApply;
                        aidApply.diagnosis=$('.diagnosis textarea').val();
                        aidApply.illnessDegree=$('.illnessDegree').val();
                        aidApply.resourceIds=that.resourceIds;
                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: 'POST',
                            url:weixin_url+'/public-benefit/saveAidApply',
                            contentType:"application/json",
                            data: JSON.stringify({aidApply}),
                            dataType: "json",
                            success: function(data){
                                if (data.code == 0) {
                                    window.location.href='./application_home3.html';
                                }else{
                                    return;
                                }
                                to_login(data);
                            }
                        });
                    }
                }
            }
        });
    }else if($('#welfare_home3').size()>0){//申请第三页
        var _token = localStorage.getItem('access_token');
        var app = new Vue({
            el: '#welfare_home3',
            data: {
                loading:true,
                showpage:false,
                aidApply:[],//传给后台的数据
                user_info:[],//初始化用户数据
            },
            created:function(){
                var that = this;
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: 'POST',
                    url:weixin_url+'/public-benefit/addAidApply',
                    contentType:"application/json",
                    success: function(data){
                        that.loading = false;
                        that.showpage = true;
                        if (data.code == 0) {
                            that.user_info = data.aidApply;
                            that.aidApply = data.aidApply;
                        }else if(data.code == 1){
                            window.location.href='./person.html';
                        }else{
                            return;
                        }
                        to_login(data);
                    }
                });
            },
            methods:{
                next_step:function(){
                    var that = this;
                    var appliedAmount = $('.appliedAmount').val();//救助金额
                    var timeRange = $('.timeRange').val();//救助期限
                    var applyDesc = $('.applyDesc').val();//申请陈述
                    if(appliedAmount == '0'){
                        $('p.appliedAmount').removeClass('dis-no');
                        setTimeout(function(){
                            $('p.appliedAmount').addClass('dis-no');
                        }, 3000); 
                    }
                    if(timeRange == '0'){
                        $('p.timeRange').removeClass('dis-no');
                        setTimeout(function(){
                            $('p.timeRange').addClass('dis-no');
                        }, 3000); 
                    }
                    if(applyDesc.length == 0){
                        $('p.applyDesc').removeClass('dis-no');
                        setTimeout(function(){
                            $('p.applyDesc').addClass('dis-no');
                        }, 3000); 
                    }
                    if (appliedAmount.length !==0 && timeRange !=='0' && applyDesc.length !==0) {
                        var aidApply = that.aidApply;
                        aidApply.appliedAmount=appliedAmount;
                        aidApply.timeRange=timeRange;
                        aidApply.applyDesc=applyDesc;
                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: 'POST',
                            url:weixin_url+'/public-benefit/saveAidApply',
                            contentType:"application/json",
                            data: JSON.stringify({aidApply}),
                            dataType: "json",
                            success: function(data){
                                if (data.code == 0) {
                                    window.location.href='./application_home_all.html';
                                }else{
                                    return;
                                }
                                to_login(data);
                            }
                        });
                    }
                }
            }
        });
    }else if($('#welfare_home_all').size()>0){//捐赠最终确认页面
        var _token = localStorage.getItem('access_token');
        var app = new Vue({
            el: '#welfare_home_all',
            data: {
                loading:true,
                showpage:false,
                aidApply:[],//传给后台的数据
                user_info:[],//初始化用户数据
                seqCn:[],
            },
            created:function(){
                var that = this;
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: 'POST',
                    url:weixin_url+'/public-benefit/addAidApply',
                    contentType:"application/json",
                    success: function(data){
                        that.loading = false;
                        that.showpage = true;
                        if (data.code == 0) {
                            that.user_info = data.aidApply;
                            that.aidApply = data.aidApply;
                            that.seqCn = data.aidApply.apartment.seqCn;
                        }else if(data.code == 1){
                            window.location.href='./person.html';
                        }else{
                            return;
                        }
                        to_login(data);
                    }
                });
            },
            methods:{
                sure_step:function(){
                    var that = this;
                    var is_agree = $('#welfare_home_all').find('.weui-agree__checkbox').prop('checked');
                    var aidApplyId = that.aidApply.id;
                    if (is_agree) {
                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: 'GET',
                            url:weixin_url+'/public-benefit/submitAidApply/'+aidApplyId,
                            contentType:"application/json",
                            success: function(data){
                                that.loading = false;
                                that.showpage = true;
                                if (data.code == 0) {
                                    $('.js_tooltips').css('display','block');
                                    setTimeout(function(){
                                        $('.js_tooltips').css('display','none');
                                        window.location.href='./person.html';
                                    }, 3000);  
                                }else{
                                    return;
                                }
                                to_login(data);
                            }
                        });
                    }else{
                        return;
                    }
                }
            }
        });

    }else if ($('#welfare_way').size()>0){//加入捐赠页面
        var _token = localStorage.getItem('access_token');
        var app = new Vue({
            el: '#welfare_way',
            data: {
                loading:true,
                showpage:false,
                show_modal:true,
                user_info:[],//初始化用户数据
            },
            created:function(){
                var that = this;
                $.ajax({
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "GET",
                    url: medicine_url + '/v1.0.0/personalCenter/getPersonalInfo',
                    contentType:"json",
                    dataType: "json",
                    success: function(data){
                        if (data.code==0){
                            that.loading = false;
                            that.showpage = true;
                            that.user_info = data.object;
                        }else{
                            return;
                        }
                        to_login(data);
                    }
                });
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: 'GET',
                    url:weixin_url+'/agreement/confirm/agreement_type_benefit_join',
                    contentType:"application/json",
                    success: function(data){
                        that.loading = false;
                        that.showpage = true;
                        if (data.code == 0) {
                            that.show_modal = !data.confirm;
                        }else{
                            return;
                        }
                        to_login(data);
                    }
                });
            },
            methods:{
                forget_pass:function(){//忘记密码弹窗
                    $.ajax({//发起请求
                        headers: {
                            'Authorization': 'bearer '+_token
                        },
                        type: 'GET',
                        url:weixin_url + '/user/user-info',
                        contentType:"application/json",
                        success: function(data){
                            if (data.code == 0) {
                                var $androidActionSheet = $('#quit_account3');
                                var $androidMask = $androidActionSheet.find('.weui-mask3');
                                $androidMask.css('display','block');
                                $androidActionSheet.fadeIn(200);
                                $androidMask.on('click',function () {
                                    $androidMask.css('display','none');
                                    $androidActionSheet.fadeOut(200);
                                });
                                var email = data.userInfo.email;
                                var phone = data.userInfo.phone;
                                if(email.length>0 && phone.length==0){//只有邮箱
                                    $('.re_phone').addClass('dis-no');
                                    $('.re_email').addClass('active');
                                    $('.email_input').html(email);
                                    $('.phone_input').addClass('dis-no');
                                }else if(email.length==0 && phone.length>0){//只有电话
                                    $('.re_email').addClass('dis-no');
                                    $('.re_phone').addClass('active');
                                    $('.phone_input').html(phone);
                                    $('.email_input').addClass('dis-no');
                                }else{
                                    $('.email_input').html(email);
                                    $('.phone_input').html(phone);
                                    $('.email_input').addClass('dis-no');
                                    $('.re_phone').addClass('active');
                                }
                            }else{

                            }
                            to_login(data);
                        }
                    });
                },
                agree_info:function(event){//同意协议
                    var that = this;
                    var is_agree = $('.welcome_page').find('.weui-agree__checkbox').prop('checked');
                    if (is_agree) {//如果同意
                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "POST",
                            url:weixin_url+'/agreement/confirm/agreement_type_benefit_join',
                            contentType:"application/json",
                            success: function(data){
                                if (data.code == 0) {
                                    that.show_modal = false;
                                }
                                to_login(data);
                            }
                        });
                    }else{
                        that.show_modal = true; 
                        return;       
                    }
                },
                jion_modal:function(){
                    var that = this;
                    that.show_modal = true;
                },
                next_step:function(){
                    var _token = localStorage.getItem('access_token');
                    var price = $('.welfare_home').find('input.gift_num').val();
                    var payPassword = $('.welfare_home').find('input.user_pass').val();
                    if(payPassword.length>0){
                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "POST",
                            url:weixin_url + '/public-benefit/donate',
                            contentType:"application/json",
                            data: JSON.stringify({coin:price,payPassword:payPassword}),
                            success: function(data){
                                if (data.code == 0) {
                                    window.location.href='./way_list.html';
                                }else{
                                    $('.error_info2').css('display','block');
                                    $('.error_info2').html(data.message);
                                        setTimeout(function(){
                                        $('.error_info2').css('display','none');
                                        $('.error_info2').html('');
                                    }, 5000);
                                    return;
                                }
                                to_login(data);
                            }
                        });
                    }else{
                        $('.error_info2').css('display','block');
                        $('.error_info2').html('请输入支付密码！');
                            setTimeout(function(){
                            $('.error_info2').css('display','none');
                            $('.error_info2').html('');
                        }, 5000);
                        return;
                    }
                }
            }
        });
        $('.look_for_pass button.get_code_btn.hasinput').live('click',function(){//此处用live因为class为后面动态生成，所以on('click')无效
            var _token = localStorage.getItem('access_token');
            if($('.re_phone').hasClass('active')) {//手机找回
                $.ajax({//手机注册请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "GET",
                    url: weixin_url +'/user/forget-pay-password/sms-code',
                    dataType: "json",
                    success: function(data){
                        if(data.code==0){
                            clearTimeout(set_time);
                            $('.get_code .remain_time').html('60');//初始化
                            $('.get_code_btn').addClass('dis-no'); 
                            $('.get_code').removeClass('dis-no'); 
                            var _Time = 60;
                            function _time(){
                                if (_Time>0){
                                    set_time = setTimeout(function(){
                                        _Time--;
                                        var remain_time = _Time;
                                        $('.get_code .remain_time').html(remain_time);
                                        _time();
                                    },1000);
                                }else{
                                    $('button.get_code_btn.hasinput').removeClass('dis-no');  
                                    $('.get_code').addClass('dis-no');
                                }
                            }
                            _time();
                        }else{
                            $('.error_info').html(data.message);
                            setTimeout(function(){
                                $('.error_info').html('');
                            }, 5000);
                            return;
                        }
                    }
                });
            }else if($('.re_email').hasClass('active')){//邮箱找回
                $.ajax({//邮箱注册请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "GET",
                    url: weixin_url +'/user/forget-pay-password/email-code',
                    dataType: "json",
                    success: function(data){
                        if(data.code !== 0){//事件处理
                            $('.error_info').html(data.message);
                            setTimeout(function(){
                                $('.error_info').html('');
                            }, 5000);
                            return;
                        }else{
                            clearTimeout(set_time);
                            $('.get_code .remain_time').html('60');//初始化
                            $('.get_code_btn').addClass('dis-no'); 
                            $('.get_code').removeClass('dis-no'); 
                            var _Time = 60;
                        
                            function _time(){
                                if (_Time>0){
                                    set_time = setTimeout(function(){
                                        _Time--;
                                        var remain_time = _Time;
                                        $('.get_code .remain_time').html(remain_time);
                                        _time();
                                    },1000);
                                }else{
                                    $('button.get_code_btn.hasinput').removeClass('dis-no');  
                                    $('.get_code').addClass('dis-no');
                                }
                            }
                            _time();
                        }
                    }
                }); 
            }
        });
        $('.look_for_pass .time_cancel').live('click',function(){//忘记密码取消
            var $androidActionSheet = $('#quit_account3');
            var $androidMask = $androidActionSheet.find('.weui-mask3');
            $androidMask.css('display','none');
            $androidActionSheet.fadeOut(200);
        });
        $('.look_for_pass .quit_sure').live('click',function(){//忘记密码确认
            var _token = localStorage.getItem('access_token');
            var code = $('.password').val();
            var newPayPassword = $('.pass_name').val();
            if (code.length>0 && newPayPassword.length>0) {
                if($('.re_phone').hasClass('active')) {//手机找回
                    $.ajax({//发起请求
                        headers: {
                            'Authorization': 'bearer '+_token
                        },
                        type: "POST",
                        url:weixin_url + '/user/forget-pay-password/phone/reset',
                        contentType:"application/json",
                        data: JSON.stringify({code:code,newPayPassword:newPayPassword}),
                        success: function(data){
                            if (data.code == 0) {
                                $('#look_info').css('display','block');
                                setTimeout(function(){
                                    $('#look_info').css('display','none');
                                    var $androidActionSheet = $('#quit_account3');
                                    var $androidMask = $androidActionSheet.find('.weui-mask3');
                                    $androidMask.css('display','none');
                                    $androidActionSheet.fadeOut(200);
                                },2000);
                            }else{
                                $('.error_info').html(data.message);
                                setTimeout(function(){
                                    $('.error_info').html('');
                                }, 5000); 
                            }
                            to_login(data);
                        }
                    });
                }else if($('.re_email').hasClass('active')){//邮箱找回
                    $.ajax({//发起请求
                        headers: {
                            'Authorization': 'bearer '+_token
                        },
                        type: "POST",
                        url:weixin_url + '/user/forget-pay-password/email/reset',
                        contentType:"application/json",
                        data: JSON.stringify({code:code,newPayPassword:newPayPassword}),
                        success: function(data){
                            if (data.code == 0) {
                                $('#look_info').css('display','block');
                                setTimeout(function(){
                                    $('#look_info').css('display','none');
                                    var $androidActionSheet = $('#quit_account3');
                                    var $androidActionSheet2 = $('#quit_account2');
                                    var $androidMask = $androidActionSheet.find('.weui-mask3');
                                    var $androidMask2 = $androidActionSheet2.find('.weui-mask2');
                                    $androidMask2.css('display','block');
                                    $androidMask.css('display','none');
                                    $androidActionSheet.fadeOut(200);
                                    $androidActionSheet2.fadeIn(200);
                                    $androidMask2.on('click',function () {
                                        $androidMask2.css('display','none');
                                        $androidActionSheet2.fadeOut(200);
                                    });
                                },2000);
                            }else{
                                $('.error_info').html(data.message);
                                setTimeout(function(){
                                    $('.error_info').html('');
                                }, 5000);
                            }
                            to_login(data);
                        }
                    });
                }
            }
        });
    }else if ($('#home_list').size()>0){//接受资助列表页面
        var _token = localStorage.getItem('access_token');
        var page = 0;//默认第一页
        var app = new Vue({
            el: '#home_list',
            data: {
                loading:true,
                show_page:false,
                user_info:[],//初始化用户数据
                status:"checking",//默认为审核中的状态
                page:[],
                has_noinfo:false,
                current:1,//当前页面
            },
            created:function(){
                var that = this;
                var status = that.status;
                $.ajax({
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "GET",
                    url: weixin_url + '/public-benefit/aidApplyPage?status='+status+'&page='+page,
                    contentType:"json",
                    dataType: "json",
                    success: function(data){
                        if (data.code==0){
                            var _contet = data.page.content;
                            that.loading = false;
                            if (_contet.length==0) {//无数据
                                that.has_noinfo=true;
                                that.show_page = false;
                            }else{
                                that.has_noinfo=false;
                                that.show_page = true;
                                that.user_info = _contet;
                                that.page = data.page.totalPages;
                            }
                        }else{
                            return;
                        }
                        to_login(data);
                    }
                });
            },
            methods:{
                change_status: function (event) {
                    var that =this;
                    var class_name = event.target.className;
                    var class_name2 = event.target.className.split(" ")[1]
                    var is_active = class_name.indexOf('active');
                    that.current = 1;
                    if (is_active !==-1) {//被选中
                        return;
                    }else{
                        if (class_name2 == 'checking') {  //审核中订单
                            var status = 'checking';  
                            that.status = 'checking';
                        }else if(class_name2 == 'yes'){//审核通过
                            var status = 'yes';
                            that.status = 'yes';
                        }else if(class_name2 == 'no'){//审核不通过
                            var status = 'no';
                            that.status = 'no';
                        }else if(class_name2 == 'editing'){//待编辑
                            var status = 'editing';
                            that.status = 'editing';//改变页面内容
                        }
                        that.show_page = false;
                        that.has_noinfo = false;
                        that.loading = true;
                        var page = 0;
                        $.ajax({
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "GET",
                            url:  weixin_url + '/public-benefit/aidApplyPage?status='+status+'&page='+page,
                            contentType:"application/json",
                            dataType: "json",
                            success: function(data){
                                if (data.code==0){
                                    var _contet = data.page.content;
                                    that.loading = false;
                                    if (_contet.length==0) {//无数据
                                        that.has_noinfo=true;
                                        that.show_page = false;
                                    }else{
                                        that.has_noinfo=false;
                                        that.show_page = true;
                                        that.user_info = _contet;
                                        that.page = data.page.totalPages;
                                    }
                                }else{
                                    return;
                                }
                                to_login(data);
                            }
                        });
                    }
                },
                change_page:function(event){
                    var that =this;
                    var class_name = event.target.className;
                    var num = event.target.innerHTML-1;
                    var is_active = class_name.indexOf('active');
                    that.current = event.target.innerHTML;
                    if (is_active !==-1) {//被选中
                        return;
                    }else{
                        that.show_page = false;
                        that.has_noinfo = false;
                        that.loading = true;
                        var status = that.status;
                        $.ajax({
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "GET",
                            url:  weixin_url + '/public-benefit/aidApplyPage?status='+status+'&page='+num,
                            contentType:"application/json",
                            dataType: "json",
                            success: function(data){
                                if (data.code==0){
                                    var _contet = data.page.content;
                                    that.loading = false;
                                    if (_contet.length==0) {//无数据
                                        that.has_noinfo=true;
                                        that.show_page = false;
                                    }else{
                                        that.has_noinfo=false;
                                        that.show_page = true;
                                        that.user_info = _contet;
                                        that.page = data.page.totalPages;
                                    }
                                }else{
                                    return;
                                }
                                to_login(data);
                            }
                        });
                    }
                },
                to_edit:function(order){//跳转
                    window.location.href='./application_home1.html';
                }
            }
        });
    }else if($("#way_list").size()>0){//神庭币捐赠明细
        var _token = localStorage.getItem('access_token');
        var page = 0;//默认第一页
        var app = new Vue({
            el: '#way_list',
            data: {
                has_noinfo:false,//没有数据
                loading:true,//加载
                show_page:false,//是否显示页面
                page:[],
                current:1,//当前页面
                my_balance:[],//数据
                datas:[],//初始数据
            },
            created:function(){
                var that = this;
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "GET",
                    url:weixin_url + '/public-benefit/donate-list?page='+page,
                    contentType:"application/json",
                    success: function(data){
                        if (data.code == 0) {
                            that.current = 1;
                            var Data_length =  data.page.content.length;
                            if (Data_length == 0) {
                                that.show_page = false;
                                that.loading = false;
                                that.has_noinfo = true;
                                return;
                            }else{//请求到数据
                                that.my_balance = data.page.content;
                                that.show_page = true;
                                that.page = data.page;
                                that.has_noinfo = false;
                                that.loading = false;
                                that.datas = data;
                            }
                        }
                        to_login(data);
                    }
                });
            },
            methods:{
                change_page:function(event){//下一页
                    var that =this;
                    var class_name = event.target.className;
                    var num = event.target.innerHTML;
                    var is_active = class_name.indexOf('active');
                    if (is_active !==-1) {//被选中
                        return;
                    }else{
                        that.show_page = false;
                        that.has_noinfo = false;
                        that.loading = true;
                        that.current = num;
                        var page = num-1;
                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "GET",
                            url:weixin_url + '/public-benefit/donate-list?page='+page,
                            contentType:"application/json",
                            success: function(data){
                                if (data.code == 0) {
                                    var Data_length =  data.page.content.length;
                                    if (Data_length == 0) {
                                        that.show_page = false;
                                        that.has_noinfo = true;
                                        that.loading = false;
                                        return;
                                    }else{//请求到数据
                                        that.my_balance = data.page.content;
                                        that.show_page = true;
                                        that.page = data.page;
                                        that.has_noinfo = false;
                                        that.loading = false;
                                    }
                                }
                                to_login(data);
                            }
                        });
                    }
                },
                modal_page:function(){
                    var that = this;
                    that.show_modal = true;
                },
            }
        });
    }else if($("#search-page").size()>0){//搜索出的商品页面
        var _token = localStorage.getItem('access_token');
        var page = 0;//默认第一页
        var app = new Vue({
            el: '#search-page',
            data: {
                has_noinfo:false,//没有数据
                loading:false,//加载
                showpage:true,//是否显示页面
                page:[],
                current:1,//当前页面
                datas:[],//初始数据
            },
            // created:function(){
            //     var that = this;
            //     $.ajax({//发起请求
            //         headers: {
            //             'Authorization': 'bearer '+_token
            //         },
            //         type: "GET",
            //         url:weixin_url + '/public-benefit/donate-list?page='+page,
            //         contentType:"application/json",
            //         success: function(data){
            //             if (data.code == 0) {
            //                 that.current = 1;
            //                 var Data_length =  data.page.content.length;
            //                 if (Data_length == 0) {
            //                     that.show_page = false;
            //                     that.loading = false;
            //                     that.has_noinfo = true;
            //                     return;
            //                 }else{//请求到数据
            //                     that.my_balance = data.page.content;
            //                     that.show_page = true;
            //                     that.page = data.page;
            //                     that.has_noinfo = false;
            //                     that.loading = false;
            //                     that.datas = data;
            //                 }
            //             }
            //             to_login(data);
            //         }
            //     });
            // },
            // methods:{
            //     change_page:function(event){//下一页
            //         var that =this;
            //         var class_name = event.target.className;
            //         var num = event.target.innerHTML;
            //         var is_active = class_name.indexOf('active');
            //         if (is_active !==-1) {//被选中
            //             return;
            //         }else{
            //             that.show_page = false;
            //             that.has_noinfo = false;
            //             that.loading = true;
            //             that.current = num;
            //             var page = num-1;
            //             $.ajax({//发起请求
            //                 headers: {
            //                     'Authorization': 'bearer '+_token
            //                 },
            //                 type: "GET",
            //                 url:weixin_url + '/public-benefit/donate-list?page='+page,
            //                 contentType:"application/json",
            //                 success: function(data){
            //                     if (data.code == 0) {
            //                         var Data_length =  data.page.content.length;
            //                         if (Data_length == 0) {
            //                             that.show_page = false;
            //                             that.has_noinfo = true;
            //                             that.loading = false;
            //                             return;
            //                         }else{//请求到数据
            //                             that.my_balance = data.page.content;
            //                             that.show_page = true;
            //                             that.page = data.page;
            //                             that.has_noinfo = false;
            //                             that.loading = false;
            //                         }
            //                     }
            //                     to_login(data);
            //                 }
            //             });
            //         }
            //     },
            //     modal_page:function(){
            //         var that = this;
            //         that.show_modal = true;
            //     },
            // }
        });
        var $toast = $('#toast');
        $('.showToast').on('click', function(){
            if ($toast.css('display') != 'none') return;
            $toast.fadeIn(100);
            setTimeout(function () {
                $toast.fadeOut(100);
            }, 2000);
        });
    }else if ($('#all_address').size()>0){//所有地址页面
        $('.add_addr').live('click',function(){
            window.location.href="../html/add-address.html";
        })
    }else if ($('#directory').size()>0){//商品分类列表
        // 请求数据方法可公用
        var _token = localStorage.getItem('access_token');
        var that = this;
        function get_info(that,page){
            var total_page = that.total_page;
            if (page < total_page) {//未加载到最后一页
                $.ajax({//发起请求
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: 'get',
                    url:weixin_url+'/sale/directory-template/'+str+'?page='+page,
                    contentType:"application/json",
                    success: function(data){
                        if (data.code == 0) {
                            var _data = data.page.content;
                            if(_data.length==0){
                                that.loading = false;
                                that.showpage = false;
                                that.has_noinfo = true;
                            }else{
                                that.loading = false;
                                that.showpage = true;
                                that.total_page = data.page.totalPages;
                                var origin_data = that.good_info;
                                var _content =data.page.content;
                                for(var i=0;i<_content.length;i++){
                                    origin_data.push(_content[i]);
                                }
                                that.good_info = origin_data;
                                $('.more_info').addClass('dis-no');
                            }
                        }else{
                            alert(data.message);
                        }
                        to_login(data);
                    }
                });
            }else{
                $('.more_info').addClass('dis-no');
                $('.no_good').removeClass('dis-no');
            }
        }
        var _url = window.location.href;
        var _index = _url.lastIndexOf("\=");  
        var str  = _url.substring(_index + 1, _url.length);
        var app = new Vue({
            el: '#directory',
            data: {
                loading:false,
                showpage:true,
                has_noinfo:false,
                good_info:[],//初始化商品数据
                page:0,//初始化页面
                total_page:1,//记录页面总数
            },
            created:function(){
                var that = this;
                var page = that.page;
                get_info(that,page);
            },
            mounted () {//触底事件
                window.addEventListener('scroll', this.handleScroll,true)
            },
            methods:{//触底事件
                handleScroll:function(event){
                    // 距离顶部距离
                    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
                    // div高度
                    var offsetHeight = document.querySelector('.goods_container').offsetHeight
                    // 页面高度
                    var clientHeight =  window.screen.height ; 
                    if (clientHeight+scrollTop+10>offsetHeight){
                        var that = this;
                        var page = that.page+1;
                        that.page = page;
                        $('.more_info').removeClass('dis-no');
                        get_info(that,page);
                    }                   
                },
                showToast:function(){
                    var $toast = $('#toast');
                    if ($toast.css('display') != 'none') return;
                    $toast.fadeIn(100);
                    setTimeout(function () {
                        $toast.fadeOut(100);
                    }, 2000);
                }
            }
        });
    }else if($('#good_sure').size()>0){//商品确认页面
        console.log(444);
    }
});




