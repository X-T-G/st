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
            $androidActionSheet.fadeIn(200);
            $androidMask.on('click',function () {
                $androidActionSheet.fadeOut(200);
            });
        });
        $('.person .time_sure').live('click',function(){//神庭问道弹窗
            var $androidActionSheet = $('#androidActionsheet');
            var $androidMask = $androidActionSheet.find('.weui-mask');
            $androidActionSheet.fadeOut(200);
            $androidMask.on('click',function () {
                $androidActionSheet.fadeIn(200);
            });
        });
        $('.quit_account').live('click',function(e){//退出弹窗
            // 弹窗
            var $androidActionSheet = $('#quit_account');
            var $androidMask = $androidActionSheet.find('.weui-mask2');
            $androidActionSheet.fadeIn(200);
            $androidMask.css('display','block');
            $androidMask.on('click',function () {
                $androidMask.css('display','none');
                $androidActionSheet.fadeOut(200);
            });
        });
        $('.person .quit_sure,.person .time_cancel').live('click',function(){//退出弹窗
            var $androidActionSheet = $('#quit_account');
            var $androidMask = $androidActionSheet.find('.weui-mask2');
            $androidActionSheet.fadeOut(200);
            $androidMask.on('click',function () {
                $androidActionSheet.fadeIn(200);
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
            },
            created:function(){
                var that = this;
                $.ajax({
                    headers: {
                        'Authorization': 'bearer '+_token
                    },
                    type: "POST",
                    url: weixin_url + '/order/prescription-order/list?page='+page+'&size=3',
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
                        }
                        that.show_page = false;
                        that.has_noinfo = false;
                        that.loading = true;
                        var page = 0;
                        $.ajax({
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "POST",
                            url: weixin_url + '/order/prescription-order/list?page='+page+'&size=3',
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
                        }
                        $.ajax({
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "POST",
                            url: weixin_url + '/order/prescription-order/list?page='+page+'&size=3',
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
                },
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
                                    if (_dd > last_date || _dd < to_day){//预约时间不正确(超出预约最终时间或小于今天时间)
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
        $('.go_last').on('click',function(){
            window.history.go(-1);
        });

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
    }else if($('.store_index').size()>0){//商品首页
      
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
                                that.has_noinfo = true;
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
            },
            methods:{
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
            }
        });
        $('#my_coin .quit_account button').live('click',function(){//点击“我愿转赠”按钮
            // ajax请求的方法
            var _token = localStorage.getItem('access_token');
            var that = this;
            $.ajax({//发起请求
                headers: {
                    'Authorization': 'bearer '+_token
                },
                type: "GET",
                url:weixin_url + '/user/pay-password',
                contentType:"application/json",
                success: function(data){
                    if (data.code == 0) {
                        if(data.payPassword){//如果已经设置支付密码
                            window.location.href='./gift.html';
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
        });
        $('#my_coin .weui-skin_android .weui-actionsheet button.time_cancel').live('click',function(){
            var $androidActionSheet2 = $('#quit_account2');
            var $androidActionSheet = $('#quit_account');
            var $androidMask2 = $androidActionSheet.find('.weui-mask2');
            var $androidMask3 = $androidActionSheet.find('.weui-mask3');
            $androidActionSheet2.fadeOut(200);
            $androidActionSheet.fadeOut(200);
            $androidMask2.on('click',function () {
                $androidActionSheet.fadeOut(200);
            });
            $androidMask3.on('click',function () {
                $androidActionSheet.fadeOut(200);
            });
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
                            }
                            to_login(data);
                        }
                    });
                },
                sure_gift:function(){
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
            var that = this;
            if ($('.gift_menu .text_info').hasClass('realName')) {//已实名
                var familyName =$('.gift_menu .realName').find('input').val();
            }else{  
                var familyName ="";
            }
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
                    data: JSON.stringify({familyName:familyName,username:username,price:price,payPassword:payPassword}),
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
                            $('.info_te').html(_content);
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
                if($('.text_info').hasClass('realName')){//若实名
                    $('.text_info.realName input').val("");
                }
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
    }else if ($('#cart').size()>0){//购物车
        // 编辑按钮
        $('.edit').live('click',function(){
            var _content = $(this).html();
            $('.weui-check').prop("checked",false);
            if (_content == '编辑'){
                $(this).html('完成');
                $('.delete_btn').removeClass('dis-no');
                $('.num_change').addClass('dis-no');
            }else{
                $(this).html('编辑');
                $('.delete_btn').addClass('dis-no');
                $('.num_change').removeClass('dis-no');
            }
        })
        // 删除按钮
        $('.delete_btn').live('click',function(){
            $(this).parents('.weui-cell.weui-check__label').remove();
        })

        // 全选
        $('.compute_btn .weui-cell.weui-check__label').live('click',function(){
            var flag = $(this).find('.weui-check').is(':checked');
            if(flag){
                $(".cart_container input[type='checkbox']").prop("checked",true);
            }else{
                $(".cart_container input[type='checkbox']").prop("checked",false);
            }
        })
        // 单选按钮
        $('.left_radio').live('click',function(){
            var flag = $(this).find("input[type='checkbox']").is(':checked');
            $(this).find("input[type='checkbox']").prop("checked",!flag);
            var all_num = $(".cart_container input[type='checkbox']").length;
            var ck_num = $(".cart_container input[type='checkbox']:checked").length;
            if (all_num == ck_num) {
                $('.compute_btn .weui-check').prop("checked",true);
            }else{
                $('.compute_btn .weui-check').prop("checked",false);
            }
        })
    };
    
});