import { Body, Controller, Headers, Param, Patch, Post } from '@nestjs/common';
import { isProdMode } from 'app.environment';
import { AutomationServiceCreateRo } from 'model/ro/automation/service.create.ro';
import { AutomationServiceUpdateRo } from 'model/ro/automation/service.update.ro';
import { AutomationService } from 'modules/services/automation/automation.service';
import { UserService } from 'modules/services/user/user.service';

@Controller('nest/v1/robots/actions')
export class RobotServiceController {
  constructor(
    private readonly automationService: AutomationService,
    private readonly userService: UserService,
  ) { }

  // 创建服务
  @Post('service')
  async createService(@Body() service: AutomationServiceCreateRo, @Headers('cookie') cookie: string) {
    if (isProdMode) {
      throw new Error('生产环境不支持此接口');
    }
    const user = await this.userService.getMe({ cookie });
    return this.automationService.createService(service, user);
  }

  @Patch('service/:serviceId')
  async updateService(
    @Param('serviceId') serviceId: string,
    @Body() data: AutomationServiceUpdateRo,
    @Headers('cookie') cookie: string
  ) {
    if (isProdMode) {
      throw new Error('生产环境不支持此接口');
    }
    const user = await this.userService.getMe({ cookie });
    return this.automationService.updateService(serviceId, data, user);
  }

}
