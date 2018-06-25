$(function(){
    // 测试
    var medicine_url = "http://192.168.0.155:8006/stmedicine";// 测试个人信息
    var assistant_url = "http://192.168.0.155:8036/stassistant";// 测试预约
    var weixin_url = "http://192.168.0.155:8046/stweixin";// 测试微信
    //线上  
    // var medicine_url = "http://www.shentingkeji.com/stmedicine";//个人信息
    // var assistant_url = "http://www.shentingkeji.com/stassistant";//预约
    // var weixin_url = "http://www.shentingkeji.com/stweixin";//微信

    // 公共方法401跳转
    function to_login(data){
        if (data !== undefined && data.code !== undefined){
            if (data.code == 401) {
                window.location.href='./login.html';
            }
        }
    }

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
                            window.location.href='./person.html';
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
                            $.ajax({//手机注册请求
                                type: "GET",
                                url: medicine_url +'/v1.0.0/signup/getSmsCode/'+_val2,
                                dataType: "json",
                                success: function(data2){
                                    if (data2.code !== 0) {
                                        var app = new Vue({
                                            el: '#Dialog2',
                                            data: {
                                                msg: data2.message,
                                            }
                                        });
                                        var $androidDialog2 = $('#Dialog2');
                                        $androidDialog2.fadeIn(200);
                                    }
                                }
                            });
                        }else{
                            if (data.code == 101) {
                                var msg = '手机号已存在';
                            }else if (data.code == 99) {
                                var msg = '查询失败';
                            }else{
                                var msg = '参数校验失败';
                            }
                            var app = new Vue({
                                el: '#Dialog2',
                                data: {
                                    msg: msg,
                                }
                            });
                            var $androidDialog2 = $('#Dialog2');
                            $androidDialog2.fadeIn(200);
                        }
                    }
                });
            }else if($('.re_email').hasClass('active')){//邮箱登录
                var _val = $('.email_input').val();
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
                $.ajax({//邮箱注册请求
                    type: "GET",
                    url: medicine_url +'/v1.0.0/sign-up/get-validate-code/email/'+_val,
                    dataType: "json",
                    success: function(data){
                        if(data.code !== 0){//事件处理
                            $('.weui-dialog .weui-dialog__bd').html(data.message);
                            var $androidDialog2 = $('#Dialog2');
                            $androidDialog2.fadeIn(200);
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
            if (invitedNum = undefined) {
                var invitedNum = null;
            }else{
                var invitedNum = invitedNum;
            }
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
                                        inviteNumber:data.object.inviteNumber
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
            $androidMask.on('click',function () {
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
                    that.show_page = false;
                    that.has_noinfo = false;
                    that.loading = true;
                    if (is_active !==-1) {//被选中
                        return;
                    }else{
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
                setname:function(event){
                    localStorage.setItem("doctor",event);
                } 
            }
        });
    }else if($('.m_reserve').size()>0){//预约页面,医生列表
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
                    that.doctor_name = doctor;
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
                            }
                            to_login(data);
                        }
                    });
                },
                methods:{
                    choose:function(event){//选日期
                        var that = this;
                        // 时间选择器
                        $('#showDatePicker').live('click', function () {
                            var year = new Date().getFullYear();
                            weui.datePicker({
                                start: year,
                                end: new Date().getFullYear(),
                                defaultValue: [new Date().getFullYear(), new Date().getMonth()+1, new Date().getDate()],
                                onConfirm: function (result) {
                                    if (result[1]<10){
                                        var _content = result[0] + '年' + '0'+ result[1] +'月'+  result[2] + '日';
                                    }else{
                                        var _content = result[0] + '年' + result[1] +'月'+  result[2] + '日';
                                    }
                                    $('.DatePicker .weui-cell__bd').html(_content);
                                    if($('.time_container').find('.can_reserve').hasClass('selected')){
                                        var _content1 = $('.can_reserve.selected').parents('.text_center').find('p.tint').html();
                                        var _content2 = $('.can_reserve.selected').html();
                                        var _content = _content1 +" "+ _content2;
                                        $('.DatePicker2 .weui-cell__bd').html(_content);
                                        var date = $('.re_date').html();
                                        var dateStr1 = date.replace('年','-');
                                        var dateStr2 = dateStr1.replace('月','-');
                                        var dateStr3 = dateStr2.replace('日','');//最终日期
                                        var _time = dateStr3 +'T'+ _content2;
                                        that._date = dateStr3;//日期
                                        that._time = _content2;//时间
                                    }else{
                                        
                                    }
                                }
                            });
                        });
                    },
                    choose2:function(e){//选时间
                        var that = this;
                        if($('.time_container').find('.can_reserve').hasClass('selected')){
                            $('.weui-skin_android').addClass('dis-no');
                            var _content1 = $('.can_reserve.selected').parents('.text_center').find('p.tint').html();
                            var _content2 = $('.can_reserve.selected').html();
                            var _content = _content1 +" "+ _content2;
                            $('.DatePicker2 .weui-cell__bd').html(_content);
                            var date = $('.re_date').html();
                            var dateStr1 = date.replace('年','-');
                            var dateStr2 = dateStr1.replace('月','-');
                            var dateStr3 = dateStr2.replace('日','');//最终日期
                            var _time = dateStr3 +'T'+ _content2;
                            that._date = dateStr3;//日期
                            that._time = _content2;//时间
                            if (date.length >0 && dateStr3.length > 0) {
                                $.ajax({//发起请求
                                    headers: {
                                        'Authorization': 'bearer '+_token
                                    },
                                    type: "GET",
                                    url:assistant_url + '/common/doctorList/'+_time,
                                    contentType:"application/json",
                                    success: function(data){
                                        if (data.code == 0) {
                                            // console.log(data);
                                            var Data_length =  data.appointmentSchedules.length;
                                            if (Data_length == 0) {
                                                $('.weui-loadmore').addClass('dis-no');//隐藏加载更多
                                                $('.has_noinfo').removeClass('dis-no');
                                                that.is_show = false;
                                            }else{//请求到数据
                                                $('.weui-loadmore').addClass('dis-no');//隐藏加载更多
                                                $('.has_noinfo').addClass('dis-no');
                                                that.is_show = true;
                                                that.my_doctors = data.appointmentSchedules;
                                                that.do_time = data.doctorAppointmentScheduleMap;
                                            }
                                        }
                                        to_login(data);
                                    }
                                });
                            }else{
                                return;
                            }
                            
                        }else{

                        }
                    },
                    choose_doctor:function(doctor){
                        var that = this;
                        that.doctor = doctor;
                    },
                    show_modal:function(){//发起请求，获取医生空余时间
                        var that = this;
                        // var _date = that._date;
                        var doctor_id = that.doctor_id;

                        $.ajax({//发起请求
                            headers: {
                                'Authorization': 'bearer '+_token
                            },
                            type: "GET",
                            url:assistant_url +'/assistant/appointment/appointmentTimeRecordByDay/'+'2018-06-23/'+doctor_id,
                            contentType:"application/json",
                            success: function(data){
                                if (data.code == 0) {
                                    var Data_length =  data.appointmentTimes.length;
                                    $('.weui-skin_android').removeClass('dis-no');
                                    if (Data_length == 0) {
                                        
                                        // that.is_show = false;
                                    }else{//请求到数据
                                        // $('.weui-loadmore').addClass('dis-no');//隐藏加载更多
                                        // $('.has_noinfo').addClass('dis-no');
                                        // that.is_show = true;
                                        // that.my_doctors = data.appointmentSchedules;
                                        // that.do_time = data.doctorAppointmentScheduleMap;
                                    }
                                }
                                to_login(data);
                            }
                        });
                    },
                    resure:function(e){//确认预约
                        var that = this;
                        var re_name = $('.re_name').val();
                        var re_sex = $('.re_sex').val();
                        var re_tel = $('.re_tel').val();
                        var re_date = $('.re_date').html();
                        var re_time = $('.re_time').html();
                        var doc_name = $('.doc_name').html();
                        var doctor = that.doctor;
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
                                data: JSON.stringify({appointmentTime:_time,remark:'',doctorEntity:doctor}),
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
                    to_detail:function(doctor){//预约的医生详情
                        localStorage.setItem("doctor_detail",JSON.stringify(doctor));
                        window.location.href='./doctor-detail.html';
                    },
                    hidden_modal:function(){//隐藏模态框
                        $('.weui-skin_android').addClass('dis-no');
                        $('.can_reserve').removeClass('selected');
                    }
                }
            });
            // 时间选中效果
            $('.choose_time div.fl.can_reserve').on('click',function(e){
                e.preventDefault();
                e.stopPropagation();
                if($(this).hasClass('selected')){//如果被选中
                    $(this).removeClass('selected');
                }else{
                    $('.choose_time div.fl').removeClass('selected');
                    $(this).addClass('selected');
                }
            });
            // 选中医生
            $('.doctor_pic input').live('click',function(e){
                var do_name = $(this).siblings('.flex-1').find('.doname').html();
                $('.doc_name').html(do_name);
            });
            $('.weui-btn.weui-btn_primary').live('click',function(){//弹窗确认
                var re_name = $('.re_name').val();
                var re_sex = $('.re_sex').val();
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
        var re_name = localStorage.getItem('re_name');
        var re_sex = localStorage.getItem('re_sex');
        var re_tel = localStorage.getItem('re_tel');
        var re_date = localStorage.getItem('re_date');
        var re_time = localStorage.getItem('re_time');
        var _token = localStorage.getItem('access_token');
        $.ajax({//发起请求
            headers: {
                'Authorization': 'bearer '+_token
            },
            type: "GET",
            url:weixin_url + '/appointment/user-appointment-list',
            contentType:"application/json",
            success: function(data){
                if (data.code == 0) {
                    console.log(data);
                    var Data_length =  data.page.content.length;
                    if (Data_length == 0) {
                        $('.weui-loadmore').addClass('dis-no');//隐藏加载更多
                        $('.has_noinfo').removeClass('dis-no');
                        // $('.my_coupon').addClass('dis-no');
                    }else{//请求到数据
                        $('.weui-loadmore').addClass('dis-no');//隐藏加载更多
                        $('.has_noinfo').addClass('dis-no');
                        // $('.my_coupon').removeClass('dis-no');
                        var app = new Vue({
                            el: '#order_detail',
                            data: {
                                my_orders:data.page.content,
                            }
                        });
                    }
                }
                to_login(data);
            }
        });
    }else if($('.doctor_detail').size()>0){
        var doctor_detail = JSON.parse(localStorage.getItem('doctor_detail'));
        // console.log(doctor_detail);
        var app = new Vue({
            el: '#doctor_detail',
            data: {
                doctor_detail:doctor_detail,
            }
        });
    }
});