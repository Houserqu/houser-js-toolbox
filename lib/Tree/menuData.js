"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const menuData = [
    {
        name: '个人中心',
        icon: 'solution',
        path: 'personal',
        children: [
            {
                path: '/manage/download/index',
                name: '我的下载',
            },
        ],
    },
    {
        name: '用户管理',
        icon: 'user',
        path: 'user',
        children: [
            {
                permission: [128],
                path: '/manage/user/index',
                name: '用户列表',
            },
            {
                path: '/manage/user/blackList',
                name: '黑名单管理',
                permission: [33],
            },
        ],
    },
    {
        name: '权限管理',
        icon: 'setting',
        path: 'auth',
        children: [
            {
                name: '角色列表',
                path: '/manage/auth/role/index',
                permission: [33],
            },
            {
                name: '分配权限',
                path: '/manage/auth/assign/index',
                permission: [33],
            },
        ],
    },
    {
        name: '开发专用',
        icon: 'file',
        path: 'template',
        children: [
            {
                name: '模板列表',
                path: '/manage/template/template/index',
                permission: [160],
            },
            {
                name: '代码片段',
                path: '/manage/template/snippet/index',
                permission: [160],
            },
            {
                name: '消息模版',
                path: '/manage/template/message/index',
                permission: [160],
            },
            {
                name: 'JSON API',
                path: '/manage/template/jsonapi/index',
                permission: [160],
            },
        ],
    },
    {
        name: 'CMS配置',
        icon: 'switcher',
        path: 'cms',
        children: [
            {
                name: '页面模块配置',
                path: '/manage/csm/page/index',
                permission: [352],
            },
            {
                name: '模块管理',
                path: '/manage/csm/modules/index',
                permission: [352],
            },
            {
                name: '专题评测管理',
                path: '/manage/evaluation/index',
                permission: [355],
            },
            {
                name: 'cms类目管理',
                path: '/manage/cms/category/index',
                permission: [356],
            },
            {
                name: '标签管理',
                path: '/manage/tag/category/index',
                permission: [354],
            },
            {
                name: '商业文章',
                path: '/manage/cms/article/index',
                permission: [359],
            },
        ],
    },
    {
        name: '订单管理',
        icon: 'folder-open',
        path: 'order',
        children: [
            {
                permission: [257],
                path: '/manage/total-order/index',
                name: '订单查询',
            },
        ],
    },
    {
        name: '知识付费运营',
        icon: 'appstore-o',
        path: 'knowledge',
        children: [
            {
                name: '专栏管理',
                path: '/manage/colmun/index',
                permission: [256],
            },
            {
                name: '知识付费订单查询',
                path: '/manage/order/index',
                permission: [288],
            },
            {
                name: '评论管理',
                path: '/manage/message/index',
                permission: [320],
            },
        ],
    },
    {
        name: '内容电商运营',
        icon: 'shopping-cart',
        path: 'e-commerce',
        children: [
            {
                name: '商品管理',
                path: '/manage/e-commerce/commodity/index',
                permission: [257],
            },
            {
                name: '品牌管理',
                path: '/manage/e-commerce/brand/index',
                permission: [257],
            },
            {
                name: '规格管理',
                path: '/manage/e-commerce/specification/index',
                permission: [257],
            },
            {
                name: '供应商',
                path: 'supplier',
                children: [
                    {
                        name: '供应商管理',
                        path: '/manage/e-commerce/supplier/index',
                        permission: [257],
                    },
                    {
                        name: '商品修改申请',
                        path: '/manage/e-commerce/supplier/stock-apply',
                        permission: [257],
                    },
                    {
                        name: '资金结算',
                        path: '/manage/e-commerce/supplier/settlement',
                        permission: [257],
                    },
                ],
            },
            {
                name: '分类管理',
                path: '/manage/e-commerce/category/index',
                permission: [257],
            },
            {
                name: '退款申请',
                path: '/manage/e-commerce/refund',
                permission: [257],
            },
        ],
    },
    {
        name: '产品运营',
        icon: 'team',
        path: 'operation',
        children: [
            {
                name: 'APP 推送配置',
                path: '/manage/app-push/index',
                permission: [323],
            },
            {
                name: '优惠券管理',
                path: '/manage/coupon/index',
                permission: [224],
            },
            {
                name: '兑换码管理',
                path: '/manage/exchange-code/index',
                permission: [290],
            },
            {
                name: '推广链接管理',
                path: '/manage/spread/index',
                permission: [225],
            },
            {
                name: 'PGC文章管理',
                path: '/manage/tips/index',
                permission: [357],
            },
        ],
    },
    {
        name: '活动管理',
        icon: 'pie-chart',
        path: 'activity',
        children: [
            {
                name: '分销活动',
                path: 'activity.distribution',
                children: [
                    {
                        name: '分销活动',
                        path: '/manage/distribution/index',
                        permission: [96],
                    },
                    {
                        name: '佣金记录',
                        path: '/manage/distribution/commission',
                        permission: [97],
                    },
                    {
                        name: '企业微信支付记录',
                        path: '/manage/distribution/weChatPayment',
                        permission: [96],
                    },
                ],
            },
            {
                name: '试用活动',
                path: 'activity.try',
                children: [
                    {
                        name: '试用活动',
                        path: '/manage/activity/try/index',
                        permission: [96],
                    },
                    {
                        name: '数据统计',
                        path: '/manage/activity/try/stat/index',
                        permission: [96],
                    },
                ],
            },
            {
                name: '营销活动',
                path: 'activity.campaign',
                children: [
                    {
                        name: '领取优惠券',
                        path: '/manage/campaign/index',
                        permission: [225],
                    },
                    {
                        name: '限时折扣',
                        path: '/manage/discount/index',
                        permission: [225],
                    },
                ],
            },
            {
                name: '用户推荐活动',
                path: '/manage/recommend/index',
                permission: [225],
            },
            {
                name: '用户推荐活动返现',
                path: '/manage/recommend/cash-back',
                permission: [225],
            },
        ],
    },
    {
        name: '在线客服',
        icon: 'phone',
        path: 'onlineService',
        children: [
            {
                name: '客服聊天',
                path: '/manage/onlineService/index',
                permission: [322],
            },
            {
                name: '客服管理',
                path: '/manage/onlineService/list',
                permission: [322],
            },
        ],
    },
    {
        name: '图书馆',
        path: 'library',
        icon: 'book',
        children: [
            {
                name: '客户管理',
                path: '/manage/library/customer',
                permission: [384],
            },
            {
                name: '分类管理',
                path: '/manage/library/classify',
                permission: [384],
            },
            {
                name: '文章管理',
                path: '/manage/library/article',
                permission: [384],
            },
            {
                name: '热门关键词',
                path: '/manage/library/hotword',
                permission: [384],
            },
            {
                name: '转载申请',
                path: '/manage/library/applyReprint',
                permission: [384],
            },
        ],
    },
    {
        name: '数据中心',
        path: 'datacenter',
        icon: 'area-chart',
        children: [
            {
                name: '微信文章管理',
                path: '/manage/data/wechat/article/list',
                permission: [417],
            },
            {
                name: '下载任务',
                path: '/manage/download/index',
                permission: [131],
            },
            {
                name: '作者管理',
                path: '/manage/article/index',
                permission: [357],
            },
        ],
    },
    {
        name: '商桥系统',
        path: 'credit-card',
        icon: 'schedule',
        children: [
            {
                name: '商品管理',
                path: '/system/commodity/index',
                permission: [160],
            },
            {
                name: '订单管理',
                path: '/system/order/index',
                permission: [160],
            },
            {
                name: '资金结算',
                path: '/system/settlement/index',
                permission: [160],
            },
        ],
    },
    {
        name: '数字营销',
        path: 'digital',
        icon: 'link',
        children: [
            {
                name: '合作意向',
                path: '/digital/Cooperation/index',
                permission: [227],
            },
        ],
    },
    {
        name: '运营渠道',
        path: 'operation-channel',
        icon: 'line-chart',
        children: [
            {
                name: '弹窗配置',
                path: '/manage/operationChannel/popupConfig/index',
                permission: [360],
            },
        ],
    },
];
exports.getMenuData = () => menuData;
