import { NodeRelEntity } from 'entities/node.rel.entity';
import { NodeRelInfo } from 'models/internal';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(NodeRelEntity)
export class NodeRelRepository extends Repository<NodeRelEntity> {

  selectMainNodeIdByRelNodeId(relNodeId: string): Promise<{ mainNodeId: string } | undefined> {
    return this.findOne({
      select: ['mainNodeId'],
      where: [{ relNodeId }],
    });
  }

  selectRelNodeIdByMainNodeId(mainNodeId: string): Promise<NodeRelEntity[]> {
    return this.createQueryBuilder('vnr')
      .select('vnr.rel_node_id', 'relNodeId')
      .innerJoin('vika_node', 'vn', 'vnr.rel_node_id = vn.node_id')
      .where('vnr.main_node_id = :mainNodeId', { mainNodeId })
      .andWhere('vn.is_rubbish = 0')
      .getRawMany();
  }

  selectNodeRelInfo(relNodeId: string): Promise<NodeRelInfo | undefined> {
    return this.createQueryBuilder('vnr')
      .select('vnr.main_node_id', 'datasheetId')
      .addSelect("JSON_UNQUOTE(JSON_EXTRACT(vnr.extra, '$.viewId'))", 'viewId')
      .addSelect('vn.node_name', 'datasheetName')
      .addSelect('vn.icon', 'datasheetIcon')
      .addSelect('vd.revision', 'datasheetRevision')
      .innerJoin('vika_node', 'vn', 'vnr.main_node_id = vn.node_id')
      .leftJoin('vika_datasheet', 'vd', 'vn.node_id = vd.dst_id')
      .where('vnr.rel_node_id = :relNodeId', { relNodeId })
      .getRawOne<NodeRelInfo>();
  }

  selectNodeRelInfoByIds(relNodeIds: string[]): Promise<NodeRelInfo[] | undefined> {
    return this.createQueryBuilder('vnr')
      .select('vnr.main_node_id', 'datasheetId')
      .addSelect('vnr.rel_node_id', 'relNodeId')
      .addSelect("JSON_UNQUOTE(JSON_EXTRACT(vnr.extra, '$.viewId'))", 'viewId')
      .addSelect('vn.node_name', 'datasheetName')
      .addSelect('vn.icon', 'datasheetIcon')
      .addSelect('vd.revision', 'datasheetRevision')
      .innerJoin('vika_node', 'vn', 'vnr.main_node_id = vn.node_id')
      .leftJoin('vika_datasheet', 'vd', 'vn.node_id = vd.dst_id')
      .where('vnr.rel_node_id IN(:...relNodeIds)', { relNodeIds })
      .getRawMany();
  }
}
