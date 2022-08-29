package com.vikadata.api.modular.social.event.feishu;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

import com.vikadata.api.config.properties.FeishuAppProperties;
import com.vikadata.boot.autoconfigure.spring.SpringContextHolder;
import com.vikadata.social.core.URIUtil;
import com.vikadata.social.feishu.card.Card;
import com.vikadata.social.feishu.card.CardMessage;
import com.vikadata.social.feishu.card.Config;
import com.vikadata.social.feishu.card.Header;
import com.vikadata.social.feishu.card.Message;
import com.vikadata.social.feishu.card.element.Button;
import com.vikadata.social.feishu.card.module.Action;
import com.vikadata.social.feishu.card.module.Div;
import com.vikadata.social.feishu.card.module.Module;
import com.vikadata.social.feishu.card.objects.Text;

/**
 * 消息卡片工厂
 *
 * @author Shawn Deng
 * @date 2020-12-02 15:13:09
 */
public class FeishuCardFactory {

    public static Message createV2EntryCardMsg(String appId) {
        String FEISHU_WEB_OPEN = "https://applink.feishu.cn/client/web_app/open?appId=%s";
        String FEISHU_INNER_WEB_VIEW = "https://applink.feishu.cn/client/web_url/open?mode=window&url=%s";
        // 创建卡片
        Header header = new Header(new Text(Text.Mode.LARK_MD, "**\uD83C\uDF89 欢迎使用维格表**"));
        Card card = new Card(new Config(false), header);
        List<Module> divList = new LinkedList<>();
        divList.add(new Div(new Text(Text.Mode.LARK_MD, "在这里，你可以收到来自维格表的成员通知、评论通知。也能够进入维格表 协同工作、查看信息，随时掌握空间站动态。")));
        divList.add(new Div(new Text(Text.Mode.LARK_MD, "维格表，新一代的团队数据协作与项目管理工具。")));
        Button entryBtn = new Button(new Text(Text.Mode.LARK_MD, "开始使用"))
                .setUrl(String.format(FEISHU_WEB_OPEN, appId))
                .setType(Button.StyleType.PRIMARY);
        FeishuAppProperties feishuAppProperties = SpringContextHolder.getBean(FeishuAppProperties.class);
        divList.add(new Div(new Text(Text.Mode.LARK_MD, String.format("或随时联系\uD83D\uDC49[在线客服](%s)", feishuAppProperties.getHelpDeskUri()))));
        Button helpBtn = new Button(new Text(Text.Mode.LARK_MD, "查看帮助"))
                .setUrl(String.format(FEISHU_INNER_WEB_VIEW, URIUtil.encodeURIComponent(feishuAppProperties.getHelpUri())));
        divList.add(new Action(Arrays.asList(entryBtn, helpBtn)));
        // 设置内容元素
        card.setModules(divList);
        return new CardMessage(card.toObj());
    }

    /**
     * 自建应用《欢迎》消息卡片
     * 自建应用不能使用app link协议进入，只能通过授权地址进入
     * @param appId 应用ID
     * @return Message
     */
    public static Message createInternalEntryCardMsg(String appId) {
        String appLink = "https://applink.feishu.cn/client/web_app/open?appId=%s";
        // 创建卡片
        Header header = new Header(new Text(Text.Mode.LARK_MD, "**\uD83C\uDF89 欢迎使用维格表**"));
        Card card = new Card(new Config(false), header);
        List<Module> divList = new LinkedList<>();
        divList.add(new Div(new Text(Text.Mode.LARK_MD, "在这里，你可以收到来自维格表的成员通知、评论通知。也能够进入维格表 协同工作、查看信息，随时掌握空间站动态。")));
        divList.add(new Div(new Text(Text.Mode.LARK_MD, "维格表，新一代的团队数据协作与项目管理工具。")));
        Button entryBtn = new Button(new Text(Text.Mode.LARK_MD, "开始使用"))
                .setUrl(String.format(appLink, appId))
                .setType(Button.StyleType.PRIMARY);
        divList.add(new Action(Collections.singletonList(entryBtn)));
        // 设置内容元素
        card.setModules(divList);
        return new CardMessage(card.toObj());
    }
}
