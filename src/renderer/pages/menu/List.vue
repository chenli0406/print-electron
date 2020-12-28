<template>
  <div>
    <pinter ref="print" :html-data="HtmlData"></pinter>
    <Form :label-width="90" inline @keydown.native.enter.prevent="getDataList('search')">
      <!-- <FormItem label="流水号">
        <Input v-model="search.serialNumber" style="width: 203px" clearable></Input>
      </FormItem> -->
      <FormItem label="物料编码">
        <Input v-model="search.materialCode" style="width: 203px" clearable></Input>
      </FormItem>
      <FormItem label="备注">
        <Input v-model="search.remark" style="width: 203px" clearable></Input>
      </FormItem>
      <FormItem label="排序">
        <Select v-model="search.sort" style="width: 200px">
          <Option v-for="(item, index) in sortList" :value="item.value" :key="index">{{ item.label }} </Option>
        </Select>
      </FormItem>
      <FormItem :label-width="10">
        <Button type="primary" icon="ios-search" @click="getDataList('search')" title="搜索">搜索</Button>
        <Button type="primary" icon="reply" @click="getReset" title="重置">重置</Button>
        <Button style="margin-left: 5px" type="primary" icon="plus-round" @click="add" title="创建">创建</Button>
        <Button style="margin-left: 5px" type="primary" icon="ios-upload-outline" @click="downloadExcel" title="导出" :loading="downloadExcelLoading">导出</Button>
        <Button style="margin-left: 5px" type="primary" icon="printer" @click="showPrint" title="设置打印机">设置打印机</Button>
        <Button style="margin-left: 5px" type="primary" icon="settings" @click="setPrint" title="打印格式"> 打印格式</Button>
      </FormItem>
    </Form>
    <!-- 表格 -->
    <Table border stripe :columns="dataList_table_column" :data="dataList" :loading="tableLoading" @on-row-dblclick="tableRowDblClick"></Table>
    <Page :total="dataListTotalCount" :current="searchParams.pageIndex" :page-size="searchParams.pageSize" @on-change="getDataList" @on-page-size-change="getDataListOnPageChange" :page-size-opts="[10, 20, 30, 40, 50]" show-total show-sizer show-elevator transfer></Page>
    <Modal v-model="modalShow" :mask-closable="false" :title="modalTitle" @on-cancel="modalShow = false">
      <div>
        <Form ref="formVali" :model="modalParams" :rules="ruleValidate" label-position="right" :label-width="130" @keydown.native.enter.prevent="enterConfirm(modalParams.id)">
          <FormItem label="物料编码" prop="materialCode">
            <Input v-model="modalParams.materialCode" :maxlength="15" show-word-limit placeholder="必填，长度不超过15位" style="width: 300px"></Input>
          </FormItem>
          <FormItem label="一级供方代码" prop="oneSupCode">
            <Input v-model="modalParams.oneSupCode" :maxlength="15" show-word-limit placeholder="必填，长度不超过15位" style="width: 300px"></Input>
          </FormItem>
          <FormItem label="DATE" prop="create_time">
            <DatePicker :value="modalParams.create_time" v-model="modalParams.create_time" value-format="yyyyMMdd" :editable="false" format="yyyyMMdd" type="date" @on-change="chagneTime" placeholder="必填" style="width: 200px"></DatePicker>
          </FormItem>
          <FormItem label="LOT" prop="lot">
            <Input v-model="modalParams.lot" :maxlength="15" show-word-limit placeholder="必填，长度不超过15位" style="width: 300px"></Input>
          </FormItem>
          <FormItem label="流水号" prop="serialNumber">
            <Input v-model="modalParams.serialNumber" :maxlength="15" show-word-limit placeholder="必填，长度不超过15位" style="width: 300px"></Input>
          </FormItem>
          <FormItem label="二级供方代码" prop="towSupCode">
            <Input v-model="modalParams.towSupCode" :maxlength="15" show-word-limit placeholder="非二级供方，填写：0000 或不填写，长度不超过15位" style="width: 300px"></Input>
          </FormItem>
          <FormItem label="品牌代码" prop="brandCode">
            <Input v-model="modalParams.brandCode" :maxlength="15" show-word-limit placeholder="无品牌物料，填写：000 或不填写，长度不超过15位" style="width: 300px"></Input>
          </FormItem>
          <FormItem label="数量" prop="count">
            <Input v-model="modalParams.count" :maxlength="8" show-word-limit placeholder="必填，长度不超过8位" style="width: 300px"></Input>
          </FormItem>
          <FormItem label="供方" prop="supplier">
            <Input v-model="modalParams.supplier" :maxlength="30" show-word-limit placeholder="必填，长度不超过30位" style="width: 300px"></Input>
          </FormItem>
          <FormItem label="物料描述" prop="description">
            <Input v-model="modalParams.description" type="textarea" :rows="2" placeholder="必填，长度50-80" :maxlength="80" style="width: 300px"></Input>
          </FormItem>
          <FormItem label="规格书型号" prop="specification">
            <Input v-model="modalParams.specification" type="textarea" :rows="2" placeholder="必填， 长度30-50" style="width: 300px" :maxlength="50"></Input>
          </FormItem>
          <FormItem label="备注" prop="remark">
            <Input v-model="modalParams.remark" type="textarea" :rows="2" :maxlength="30" placeholder="必填长度30-50" style="width: 300px"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="modalShow = false"> 取消 </Button>
        <Button type="primary" v-if="!modalParams.id" @click="addConfirm" :loading="modalBtnLoading">确认 </Button>
        <Button type="primary" v-if="modalParams.id" @click="editConfirm" :loading="modalBtnLoading">确认 </Button>
      </div>
    </Modal>
    <Modal v-model="delModalShow" width="370">
      <p slot="header" style="color: #f60; text-align: center">
        <Icon type="information-circled"></Icon>
        <span>删除确认</span>
      </p>
      <div style="text-align: center; line-height: 26px">
        <p>
          将永久删除流水号为 <strong>{{ modalParams.serialNumber }}</strong> ，且<strong>无法恢复</strong>。
        </p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long @click="delConfrim" :loading="modalBtnLoading">删除 </Button>
      </div>
    </Modal>
    <Modal v-model="lookModalShow" title="Custom width" :width="printDatahtml.width">
      <p slot="header" style="color: #f60; text-align: center">
        <Icon type="information-circled"></Icon>
        <span>物料标识打印查看： </span>
      </p>
      <div :style="'border: 1px solid #000; line-height:' + printDatahtml.lineHeight + 'px'">
        <p :style="'font-weight: 600; text-align: center; padding: 15px 10px 10px 10px; font-size:' + printDatahtml.MfontSize + 'px'">{{ plainCode }}</p>
        <div class="print-box" :style="'font-size:' + printDatahtml.CfontSize + 'px'">
          <div class="code">
            <vue-qr :text="plainCode" :margin="10" colorDark="#000" colorLight="#fff" :size="parseInt(printDatahtml.eWidth)"></vue-qr>
          </div>
          <div class="print-right">
            <div class="print-item">
              <p style="margin-right: 4%">
                物料编码：<span class="fontW">{{ printParams.materialCode }}</span>
              </p>
              <p class="fontW">
                DATE：<span>{{ printParams.create_time }}</span>
              </p>
            </div>
            <p class="fontW" style="text-align: justify;">
              物料描述：<span>{{ printParams.description }}</span>
            </p>
            <div class="print-count">
              <div style="margin-right: 4%" class="print-count-box">
                <p class="fontW" style="margin-bottom: 10px;">
                  LOT：<span  style="word-wrap: break-word">{{ printParams.lot }}</span>
                </p>
                <p>
                  数量：<span class="fontW">{{ printParams.count }}</span>
                </p>
              </div>
              <div class="count">
                <p style="margin-bottom:10px;">数量条码：</p>
                <vue-qr :text="printCount" :margin="10" colorDark="#000" colorLight="#fff" :size="parseInt(printDatahtml.sWidth)"></vue-qr>
              </div>
            </div>
            <p style="text-align: justify;">
              供方：<span>{{ printParams.supplier }}</span>
            </p>
            <p style="text-align: justify;">
              规格书型号：<span class="fontW">{{ printParams.specification }}</span>
            </p>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button @click="lookModalShow = false"> 取消 </Button>
      </div>
    </Modal>
    <Modal width="400" v-model="dialogVisible" title="打印机设置" :mask-closable="false" @on-cancel="dialogVisible = false">
      <div>
        <RadioGroup v-model="vertical" vertical @on-change="changes">
          <Radio v-for="item in printList" :label="item.name" :key="item.name">
            <span>{{ item.name }}</span>
          </Radio>
        </RadioGroup>
      </div>
      <div slot="footer">
        <Button @click="dialogVisible = false"> 取消 </Button>
        <Button type="primary" @click="selectPrint">确认 </Button>
      </div>
    </Modal>
    <Modal width="600" v-model="setPrintVisible" title="设置打印格式" :mask-closable="false" @on-cancel="setPrintVisible = false">
      <Form ref="setPrintForm" :model="setPrintParams" :rules="setPrintRule" :label-width="130" inline label-position="right">
        <Row>
          <Col span="12">
            <FormItem label="打印宽度" prop="width">
              <Input v-model="setPrintParams.width" :maxlength="3" placeholder="必填" style="width: 130px"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="明码字体大小" prop="MfontSize">
              <Select v-model="setPrintParams.MfontSize" style="width: 130px">
                <Option v-for="(item, index) in MfontSizeList" :value="item.value" :key="index">{{ item.label }} </Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="内容字体大小" prop="CfontSize">
              <Select v-model="setPrintParams.CfontSize" style="width: 130px">
                <Option v-for="(item, index) in CfontSizeList" :value="item.value" :key="index">{{ item.label }} </Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="二维码宽度" prop="eWidth">
              <Input v-model="setPrintParams.eWidth" :maxlength="3" placeholder="必填" style="width: 130px"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="二维码高度" prop="eHeight">
              <Input v-model="setPrintParams.eHeight" :maxlength="3" placeholder="必填" style="width: 130px"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="数量条码宽度" prop="sWidth">
              <Input v-model="setPrintParams.sWidth" :maxlength="3" placeholder="必填" style="width: 130px"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="数量条码高度" prop="sHeight">
              <Input v-model="setPrintParams.sHeight" :maxlength="3" placeholder="必填" style="width: 130px"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="行高(上下间距)" prop="lineHeight">
              <Input v-model="setPrintParams.lineHeight" :maxlength="2" placeholder="必填" style="width: 130px"></Input>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button @click="setPrintVisible = false"> 取消 </Button>
        <Button type="primary" @click="setPrintValue">确认 </Button>
      </div>
    </Modal>
    <Modal width="300" v-model="printVisible" title="设置打印份数" :mask-closable="false" @on-cancel="printVisible = false">
      <Form ref="setPrintref" :model="setPrintCount" :rules="setPrintNumRules" :label-width="80" label-position="right">

         <FormItem label="打印份数" prop="printCount">
           <Input v-model="setPrintCount.printCount" label="打印份数" :maxlength="8" placeholder="必填"></Input>
          </FormItem>
        
      </Form>
      <div slot="footer">
        <Button @click="printVisible = false"> 取消 </Button>
        <Button type="primary" @click="print">打印 </Button>
      </div>
    </Modal>
  </div>
</template>
<script>
// import util from '../../utils/util';
import download from '../../utils/download';
import VueQr from 'vue-qr';
import Pinter from '../../components/pinter';
const ipcRenderer = require('electron').ipcRenderer;
export default {
  components: {
    VueQr,
    Pinter,
  },
  data() {
    return {
      // loading
      downloadExcelLoading: false,
      modalBtnLoading: false,
      tableLoading: false,
      lookModalShow: false,
      dialogVisible: false,
      setPrintVisible: false,
      printVisible: false,
      vertical: '',
      // ----特殊枚举
      sortList: [
        {
          label: '按创建倒序',
          value: 'DESC',
        },
        {
          label: '按创建顺序',
          value: 'ASC',
        },
      ],
      // ----常用
      search: {
        serialNumber: '',
        materialCode: '',
        sort: 'DESC',
        pageIndex: 1,
        pageSize: 10,
        remark: '',
      },
      time: '',
      searchParams: {},
      plainCode: '',
      printCount: '',
      dataList: [],
      printList: [],
      rowData: '',
      HtmlData: '',
      dataListTotalCount: 0,
      dataList_table_column: [
        {
          title: '物料编码',
          key: 'materialCode',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '一级供方代码',
          key: 'oneSupCode',
          align: 'center',
          minWidth: 200,
        },
        {
          title: 'DATE',
          key: 'create_time',
          align: 'center',
          minWidth: 150,
        },
        {
          title: 'LOT',
          key: 'lot',
          align: 'center',
          minWidth: 150,
        },
        {
          title: '流水号',
          key: 'serialNumber',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '二级供方代码',
          key: 'towSupCode',
          align: 'center',
          minWidth: 200,
        },
        {
          title: '品牌代码',
          key: 'brandCode',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '数量',
          key: 'count',
          align: 'center',
          minWidth: 150,
        },
        {
          title: '供方',
          key: 'supplier',
          align: 'center',
          minWidth: 150,
        },
        {
          title: '物料描述',
          key: 'description',
          align: 'center',
          minWidth: 200,
        },
        {
          title: '规格书型号',
          key: 'specification',
          align: 'center',
          minWidth: 150,
        },
        {
          title: '备注',
          key: 'remark',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '打印次数',
          key: 'print',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '操作',
          key: 'action',
          width: 160,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'success',
                  size: 'small',
                  icon: 'printer',
                },
                attrs: {
                  title: '打印',
                },
                on: {
                  click: () => {
                    this.setPrintNum(params.row);
                  },
                },
              }),
              h('Button', {
                props: {
                  type: 'info',
                  size: 'small',
                  icon: 'ios-list-outline',
                },
                attrs: {
                  title: '查看',
                },
                style: {
                  'margin-left': '5px',
                },
                on: {
                  click: () => {
                    this.lookPrint(params.row);
                  },
                },
              }),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  icon: 'edit',
                },
                attrs: {
                  title: '修改',
                },
                style: {
                  'margin-left': '5px',
                },
                on: {
                  click: () => {
                    this.edit(params.row);
                  },
                },
              }),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small',
                  icon: 'trash-b',
                },
                attrs: {
                  title: '删除',
                },
                style: {
                  'margin-left': '5px',
                },
                on: {
                  click: () => {
                    this.del(params.row);
                  },
                },
              }),
            ]);
          },
        },
      ],
      modalShow: false,
      modalParams: {
        serialNumber: '',
        materialCode: '',
        create_time: '',
        lot: '',
        count: '',
        supplier: '',
        oneSupCode: '',
        towSupCode: '',
        brandCode: '',
        description: '',
        specification: '',
        print: '0',
        remark: '',
      },
      setPrintParams: {
        width: '330',
        MfontSize: '10',
        CfontSize: '9',
        eWidth: '90',
        eHeight: '90',
        sWidth: '50',
        sHeight: '50',
        lineHeight: '10',
      },
      printDatahtml: '',
      printParams: '',
      delModalShow: false,
      ruleValidate: {
        serialNumber: [{ required: true, message: '请输入 流水号，长度不超过 15位', max: 15 }],
        materialCode: [{ required: true, message: '请输入 物料编码，长度不超过 15位', max: 15 }],
        create_time: [{ required: true, message: '请选择 DATE' }],
        lot: [{ required: true, message: '请输入 LOT，长度不超过 15位', max: 15 }],
        count: [{ required: true, message: '请输入 数量，长度不超过 8位' }],
        supplier: [{ required: true, message: '请输入 供方，长度不超过 30位', max: 30 }],
        oneSupCode: [{ required: true, message: '请输入 一级供方代码，长度不超过 15位', max: 15 }],
        description: [{ required: true, message: '请输入 物料描述，长度不超过 80位', max: 80 }],
        specification: [{ required: true, message: '请输入 规格书型号，长度不超过 50位', max: 50 }],
      },
      setPrintRule: {
        width: [{ required: true, message: '请输入长度为3位的数字', min: 3, pattern: /^((?!0)\d{3}|100)$/ }],
        eWidth: [{ required: true, message: '请输入最小为2位的数字', min: 2, pattern: /^((?!0)\d{2,3}|100)$/ }],
        eHeight: [{ required: true, message: '请输入最小为2位的数字', min: 2, pattern: /^((?!0)\d{2,3}|100)$/ }],
        sWidth: [{ required: true, message: '请输入最小为2位的数字', min: 2, pattern: /^((?!0)\d{2,3}|100)$/ }],
        sHeight: [{ required: true, message: '请输入最小为2位的数字', min: 2, pattern: /^((?!0)\d{2,3}|100)$/ }],
        lineHeight: [{ required: true, message: '请输入数字', min: 1, pattern: /^((?!0)\d{1,2}|100)$/ }],
      },
      setPrintCount: {
        printCount: 1,
      },
      setPrintNumRules: {
        printCount: [{ required: true, message: '请输入数字', min: 8, pattern: /^((?!0)\d{1,5000}|5000)$/ }],
      },
      downloadExcelSQL: '',
      MfontSizeList: [
        {
          label: '20px',
          value: '20',
        },
        {
          label: '18px',
          value: '18',
        },
        {
          label: '16px',
          value: '16',
        },
        {
          label: '14px',
          value: '14',
        },
        {
          label: '12px',
          value: '12',
        },
         {
          label: '11px',
          value: '11',
        },
        {
          label: '10px',
          value: '10',
        },
         {
          label: '9px',
          value: '9',
        },
        {
          label: '8px',
          value: '8',
        },
      ],
      CfontSizeList: [
        {
          label: '20px',
          value: '20',
        },
        {
          label: '18px',
          value: '18',
        },
        {
          label: '16px',
          value: '16',
        },
        {
          label: '14px',
          value: '14',
        },
        {
          label: '12px',
          value: '12',
        },
        {
          label: '11px',
          value: '11',
        },
        {
          label: '10px',
          value: '10',
        },
         {
          label: '9px',
          value: '9',
        },
        {
          label: '8px',
          value: '8',
        },
      ],
    };
  },
  computed: {
    modalTitle() {
      return this.modalParams.id ? '修改' : '创建';
    },
  },
  mounted() {
    this.getPrintListHandle();
  },
  methods: {
    // 搜索
    getDataList(method) {
      this.tableLoading = true;
      if (method === 'search') {
        this.searchParams = JSON.parse(JSON.stringify(this.search));
      }
      if (typeof method === 'number') {
        this.searchParams.pageIndex = method;
      }
      const searchParams = this.searchParams;
      const whereSQL = `WHERE serialNumber LIKE '%${searchParams.serialNumber}%' AND materialCode LIKE '%${searchParams.materialCode}%' AND remark LIKE '%${searchParams.remark}%' `;
      const pageSQL = `LIMIT ${searchParams.pageSize} OFFSET ${(searchParams.pageIndex - 1) * searchParams.pageSize} `;
      const orderSQL = `ORDER BY id ${searchParams.sort} `;
      // 导出sql
      this.downloadExcelSQL = 'SELECT * from TABLE_PRINTLIST ' + whereSQL + orderSQL;
      const rowSQL = this.downloadExcelSQL + pageSQL;
      const countSQL = 'SELECT COUNT(id) AS totalCount from TABLE_PRINTLIST ' + whereSQL;
      this.$logger(rowSQL);
      this.$db.all(rowSQL, (err, res) => {
        if (err) {
          this.$logger(err);
          this.$Notice.error({
            title: '搜索失败',
            desc: err,
          });
        } else {
          if (!res.length && searchParams.pageIndex !== 1) {
            // 该页没数据，又不是第一页，就往上一页翻
            this.getDataList(searchParams.pageIndex - 1);
          } else {
            this.dataList = res;
          }
        }
        this.tableLoading = false;
      });
      this.$logger(countSQL);
      this.$db.get(countSQL, (err, res) => {
        if (err) {
          this.$logger(err);
          this.$Notice.error({
            title: '搜索失败',
            desc: err,
          });
        } else {
          this.dataListTotalCount = res.totalCount;
        }
      });
    },
    // pageSize改变
    getDataListOnPageChange(pageSize) {
      this.search.pageSize = pageSize;
      this.getDataList('search');
    },
    // 双击表格某行
    tableRowDblClick(row) {
      // this.direct(row);
    },
    // 新增
    add() {
      this.$refs.formVali.resetFields();
      this.modalParams = this.$options.data().modalParams;
      this.modalShow = true;
    },
    // 新增确认
    addConfirm() {
      this.$refs.formVali.validate((valid) => {
        if (valid) {
          this.modalBtnLoading = true;
          let modalParams = this.modalParams;
          if (this.time !== '') {
            modalParams.create_time = this.time;
          }
          // 检测id是否存在
          const SQL = `SELECT COUNT(id) AS totalCount from TABLE_PRINTLIST WHERE id = '${modalParams.id}'`;
          this.$db.get(SQL, (err, res) => {
            if (err) {
              this.$logger(err);
              this.$Notice.error({
                title: '搜索失败',
                desc: err,
              });
            } else {
              if (res.totalCount) {
                this.$Message.warning({
                  content: '已存在',
                });
                this.modalBtnLoading = false;
              } else {
                const SQL = `INSERT INTO TABLE_PRINTLIST (serialNumber,materialCode,create_time,lot,count,supplier,oneSupCode,towSupCode,brandCode,description,specification,remark,print)
                VALUES ('${modalParams.serialNumber}','${modalParams.materialCode}','${modalParams.create_time}','${modalParams.lot}','${modalParams.count}','${modalParams.supplier}','${modalParams.oneSupCode}','${modalParams.towSupCode}','${modalParams.brandCode}','${modalParams.description}','${modalParams.specification}','${modalParams.remark}','${modalParams.print}')`;
                this.$logger(SQL);
                this.$db.run(SQL, (err) => {
                  if (err) {
                    this.$logger(err);
                    this.$Notice.error({
                      title: '新增失败',
                      desc: err,
                    });
                  } else {
                    this.modalShow = false;
                    this.$Message.success({
                      content: '新增成功',
                    });
                    this.getDataList(1);
                  }
                  this.modalBtnLoading = false;
                });
              }
            }
          });
        }
      });
    },
    // 跳转
    direct(row) {
      this.$router.push({
        path: '/detailList',
        query: {
          goods_id: row.id,
        },
      });
    },
    // 编辑
    edit(row) {
      this.time = row.create_time;
      this.$refs.formVali.resetFields();
      this.modalParams = {
        id: row.id,
        serialNumber: row.serialNumber,
        materialCode: row.materialCode,
        create_time: row.create_time,
        lot: row.lot,
        count: row.count,
        supplier: row.supplier,
        oneSupCode: row.oneSupCode,
        towSupCode: row.towSupCode,
        brandCode: row.brandCode,
        description: row.description,
        specification: row.specification,
        remark: row.remark,
        print: row.print,
      };
      this.modalShow = true;
    },
    // 编辑确认
    editConfirm() {
      this.$refs.formVali.validate((valid) => {
        if (valid) {
          this.modalBtnLoading = true;
          let modalParams = this.modalParams;
          if (this.time !== '') {
            modalParams.create_time = this.time;
          }
          // 检测id是否存在
          const SQL = `SELECT id from TABLE_PRINTLIST WHERE id = '${modalParams.id}'`;
          this.$db.get(SQL, (err, res) => {
            if (err) {
              this.$logger(err);
              this.$Notice.error({
                title: '搜索失败',
                desc: err,
              });
            } else {
              if (res && res.id !== modalParams.id) {
                this.$Message.warning({
                  content: '已存在',
                });
                this.modalBtnLoading = false;
              } else {
              const SQL = `UPDATE TABLE_PRINTLIST SET
               serialNumber='${modalParams.serialNumber}'
              ,create_time='${modalParams.create_time}'
              ,materialCode='${modalParams.materialCode}'
              ,lot='${modalParams.lot}'
              ,count='${modalParams.count}'
              ,supplier='${modalParams.supplier}'
              ,oneSupCode='${modalParams.oneSupCode}'
              ,towSupCode='${modalParams.towSupCode}'
              ,brandCode='${modalParams.brandCode}'
              ,description='${modalParams.description}'
              ,specification='${modalParams.specification}'
              ,remark='${modalParams.remark}'
              ,print='${modalParams.print}'
              WHERE id = ${modalParams.id}`;
                this.$logger(SQL);
                this.$db.run(SQL, (err) => {
                  if (err) {
                    this.$logger(err);
                    this.$Notice.error({
                      title: '编辑失败',
                      desc: err,
                    });
                  } else {
                    this.modalShow = false;
                    this.$Message.success({
                      content: '编辑成功',
                    });
                    this.getDataList();
                  }
                  this.modalBtnLoading = false;
                });
              }
            }
          });
        }
      });
    },
    enterConfirm(id) {
      if (id) {
        this.editConfirm();
      } else {
        this.addConfirm();
      }
    },
    // 删除
    del(row) {
      this.modalParams = {
        id: row.id,
        serialNumber: row.serialNumber,
      };
      this.delModalShow = true;
    },
    // 设置份数
    setPrintNum(row) {
      this.printVisible = true;
      this.HtmlData = row;
      this.HtmlData.printCount = row.count.toString();
      if (this.HtmlData.towSupCode === '' && this.HtmlData.brandCode === '') {
        this.HtmlData.plainCode = this.HtmlData.materialCode + '-' + this.HtmlData.oneSupCode + '-' + this.HtmlData.create_time + '-' + this.HtmlData.lot + '-' + this.HtmlData.serialNumber;
      }
      if (this.HtmlData.towSupCode !== '' && this.HtmlData.brandCode === '') {
        this.HtmlData.plainCode = this.HtmlData.materialCode + '-' + this.HtmlData.oneSupCode + '-' + this.HtmlData.create_time + '-' + this.HtmlData.lot + '-' + this.HtmlData.serialNumber + '-' + this.HtmlData.towSupCode;
      }
      if (this.HtmlData.towSupCode === '' && this.HtmlData.brandCode !== '') {
        this.HtmlData.plainCode = this.HtmlData.materialCode + '-' + this.HtmlData.oneSupCode + '-' + this.HtmlData.create_time + '-' + this.HtmlData.lot + '-' + this.HtmlData.serialNumber + '-(' + this.HtmlData.brandCode + ')';
      }
      if (this.HtmlData.towSupCode !== '' && this.HtmlData.brandCode !== '') {
        this.HtmlData.plainCode = this.HtmlData.materialCode + '-' + this.HtmlData.oneSupCode + '-' + this.HtmlData.create_time + '-' + this.HtmlData.lot + '-' + this.HtmlData.serialNumber + '-' + this.HtmlData.towSupCode + '(' + this.HtmlData.brandCode + ')';
      }
    },
    // 打印
    print() {
      this.$refs.setPrintref.validate((valid) => {
        if (valid) {
          let arr = [];
          arr.push(this.HtmlData);
          let j = arr;
          j[0].printNum = parseInt(this.setPrintCount.printCount);
          this.$refs.print.print(j);
          this.printVisible= false;
        }
      });
    },
    // 查看
    lookPrint(row) {
      this.printParams = row;
      this.printCount = row.count.toString();
      this.printDatahtml = this.$electronStore.get('setPrintData');
      if (this.printParams.towSupCode === '' && this.printParams.brandCode === '') {
        this.plainCode = this.printParams.materialCode + '-' + this.printParams.oneSupCode + '-' + this.printParams.create_time + '-' + this.printParams.lot + '-' + this.printParams.serialNumber;
      }
      if (this.printParams.towSupCode !== '' && this.printParams.brandCode === '') {
        this.plainCode = this.printParams.materialCode + '-' + this.printParams.oneSupCode + '-' + this.printParams.create_time + '-' + this.printParams.lot + '-' + this.printParams.serialNumber + '-' + this.printParams.towSupCode;
      }
      if (this.printParams.towSupCode === '' && this.printParams.brandCode !== '') {
        this.plainCode = this.printParams.materialCode + '-' + this.printParams.oneSupCode + '-' + this.printParams.create_time + '-' + this.printParams.lot + '-' + this.printParams.serialNumber + '-(' + this.printParams.brandCode + ')';
      }
      if (this.printParams.towSupCode !== '' && this.printParams.brandCode !== '') {
        this.plainCode = this.printParams.materialCode + '-' + this.printParams.oneSupCode + '-' + this.printParams.create_time + '-' + this.printParams.lot + '-' + this.printParams.serialNumber + '-' + this.printParams.towSupCode + '(' + this.printParams.brandCode + ')';
      }
      this.lookModalShow = true;
    },
    //  删除确认
    delConfrim() {
      this.$db.serialize(() => {
        this.$db.run('BEGIN');
        // 删除所有明细
        const deleteDetailSQL = `DELETE FROM GOODS_DETAIL_LIST WHERE id = ${this.modalParams.id}`;
        this.$logger(deleteDetailSQL);
        this.$db.run(deleteDetailSQL, (err) => {
          if (err) {
            this.$logger(err);
            this.$db.run('ROLLBACK');
            this.$Notice.error({
              title: '删除失败',
              desc: err,
            });
          }
        });
        const deleteSQL = `DELETE FROM TABLE_PRINTLIST WHERE id = ${this.modalParams.id}`;
        this.$logger(deleteSQL);
        this.$db.run(deleteSQL, (err) => {
          if (err) {
            this.$logger(err);
            this.$db.run('ROLLBACK');
            this.$Notice.error({
              title: '删除失败',
              desc: err,
            });
          }
        });
        this.$db.run('COMMIT');
        this.delModalShow = false;
        this.$Message.success({
          content: '删除成功',
        });
        this.getDataList();
      });
    },
    // 导出表格
    downloadExcel() {
      this.downloadExcelLoading = true;
      this.$db.all(this.downloadExcelSQL, (err, res) => {
        if (err) {
          this.$logger(err);
          this.$Notice.error({
            title: '搜索失败',
            desc: err,
          });
        } else {
          const data = [['物料编码', '一级供方代码', 'DATE', 'LOT', '流水号', '二级供方代码', '品牌代码', '数量', '供方', '物料描述', '规格书型号', '备注', '打印次数']];
          for (const item of res) {
            data.push([item.materialCode, item.oneSupCode, item.create_time, item.lot, item.serialNumber, item.towSupCode, item.brandCode, item.count, item.supplier, item.description, item.specification, item.remark, item.print]);
          }
          const name = '打印列表';
          download
            .excel(name, [
              {
                name,
                data,
              },
            ])
            .then((arg) => {
              this.downloadExcelLoading = false;
              if (arg === 'completed') {
                this.$Message.success({
                  content: '导出成功',
                });
              } else {
                this.$Message.warning({
                  content: '导出取消',
                });
              }
            })
            .catch((err) => {
              this.downloadExcelLoading = false;
              this.$Notice.error({
                title: '导出失败',
                desc: err,
              });
            });
        }
      });
    },
    // 时间格式
    chagneTime(e) {
      this.time = e;
    },
    // 设置打印机
    showPrint() {
      this.dialogVisible = true;
    },
    handlePrintDialogCancel() {
      this.dialogVisible = false;
    },
    selectPrint() {
      if (this.rowData) {
        this.dialogVisible = false;
        this.$electronStore.set('printForm', this.rowData);
        this.$Message.success({ content: '设置成功' });
      } else {
        this.$Message.warning('您还没有选择打印机');
      }
    },
    // 获取打印机列表
    getPrintListHandle() {
      // 改用ipc异步方式获取列表，解决打印列数量多的时候导致卡死的问题
      ipcRenderer.send('getPrinterList');
      ipcRenderer.once('getPrinterList', (event, data) => {
        // 过滤可用打印机
        this.printList = data.filter((element) => element.status === 0);
        console.log(this.printList);
      });
    },
    changes(data) {
      this.rowData = data;
    },
    // 设置打印格式
    setPrint() {
      this.setPrintVisible = true;
    },
    // 设置打印格式提交
    setPrintValue() {
      this.$refs.setPrintForm.validate((valid) => {
        if (valid) {
          this.$electronStore.set('setPrintData', this.setPrintParams);
          this.setPrintVisible = false;
          this.$Message.success({ content: '设置成功' });
        }
      });
    },
    // 重置
    getReset() {
      this.search = {
        serialNumber: '',
        materialCode: '',
        sort: 'DESC',
        pageIndex: 1,
        pageSize: 10,
        remark: '',
      };
      this.getDataList('search');
    },
  },
  created() {
    this.getDataList('search');
    if (this.$electronStore.get('setPrintData') == '' || this.$electronStore.get('setPrintData') == null) {
      this.$electronStore.set('setPrintData', this.setPrintParams);
    } else {
      this.setPrintParams = this.$electronStore.get('setPrintData');
    }
  },
};
</script>
<style lang="less">
.print-box {
  display: flex;
  padding-right: 10px;
  font-family:"Microsoft YaHei";
  p {
    margin: 0;
  }
}
.print-item {
  display: flex;
  justify-content: flex-start;
}
.print-right {
  margin-left: 4px;
  width: 100%;
  p{
    margin: 5px 0;
  }
}
.count {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.print-count {
  display: flex;
  align-items: center;
}
.fontW {
  font-weight: 600;
}
</style>
