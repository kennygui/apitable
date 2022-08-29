package com.vikadata.api.modular.finance.core;

import com.vikadata.api.modular.finance.model.CreateOrderRo;
import com.vikadata.api.util.billing.BillingConfigManager;
import com.vikadata.system.config.billing.Price;

public class DefaultOrderArguments implements OrderArguments {

    private final String spaceId;

    private final Price price;

    public DefaultOrderArguments(String spaceId, Price price) {
        this.spaceId = spaceId;
        this.price = price;
    }

    public DefaultOrderArguments(final CreateOrderRo input) {
        if (input == null) {
            this.spaceId = null;
            this.price = null;
        }
        else {
            this.spaceId = input.getSpaceId();
            this.price = BillingConfigManager.getPriceBySeatAndMonth(input.getProduct(), input.getSeat(), input.getMonth());
        }
    }

    @Override
    public String getSpaceId() {
        return this.spaceId;
    }

    @Override
    public Price getPrice() {
        return this.price;
    }
}
