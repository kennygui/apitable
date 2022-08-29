package com.vikadata.api.modular.finance.model;

import cn.hutool.json.JSONUtil;
import com.pingplusplus.model.Charge;
import lombok.Data;

/**
 * ping++ 支付成功通知
 * @author Shawn Deng
 * @date 2022-02-17 18:37:05
 */
@Data
public class PingChargeSuccess {

    private String id;

    private String channel;

    private String orderNo;

    private int amount;

    private int amountSettle;

    private String currency;

    private String subject;

    private String body;

    private Long timePaid;

    private Long timeExpire;

    private String transactionNo;

    public static PingChargeSuccess build(Charge charge) {
        PingChargeSuccess chargeSuccess = new PingChargeSuccess();
        chargeSuccess.setId(charge.getId());
        chargeSuccess.setChannel(charge.getChannel());
        chargeSuccess.setOrderNo(charge.getOrderNo());
        chargeSuccess.setAmount(charge.getAmount());
        chargeSuccess.setAmountSettle(charge.getAmountSettle());
        chargeSuccess.setCurrency(charge.getCurrency());
        chargeSuccess.setSubject(charge.getSubject());
        chargeSuccess.setBody(charge.getBody());
        chargeSuccess.setTimePaid(charge.getTimePaid());
        chargeSuccess.setTimeExpire(charge.getTimeExpire());
        chargeSuccess.setTransactionNo(charge.getTransactionNo());
        return chargeSuccess;
    }

    @Override
    public String toString() {
        return JSONUtil.toJsonStr(this);
    }
}
