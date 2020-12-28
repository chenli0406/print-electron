<template>
  <div class="container">
    <webview id="printWebview" ref="printWebview" :src="fullPath" nodeintegration />
  </div>
</template>
<script>
import { ipcRenderer } from 'electron';
import path from 'path';
import { log } from 'console';
export default {
  name: 'Pinter',
  props: {
    // HtmlData: {
    //   type: String,
    //   default: '',
    // },
  },
  data() {
    return {
      printList: [],
      printDeviceName: '',
      fullPath: path.join(__static, 'print.html'),
      messageBox: null,
      htmlData: '',
      list: [],
      array: [],
      htmlList: [],
      itemData: '',
    };
  },

  mounted() {
    const webview = this.$refs.printWebview;
    webview.addEventListener('ipc-message', (event) => {
      if (event.channel === 'webview-print-do') {
        webview.print(
          {
            silent: true,
            printBackground: false,
            deviceName: this.printDeviceName,
          },
          (data) => {
            // console.log(data);
            if (data == true) {
              const SQL = `SELECT * from TABLE_PRINTLIST WHERE id = '${this.itemData.id}'`;
              this.$db.get(SQL, (err, res) => {
                if (res) {
                  const SQL = `UPDATE TABLE_PRINTLIST SET
                  serialNumber='${this.itemData.serialNumber}'
                  ,create_time='${this.itemData.create_time}'
                  ,lot='${this.itemData.lot}'
                  ,count='${this.itemData.count}'
                  ,supplier='${this.itemData.supplier}'
                  ,oneSupCode='${this.itemData.oneSupCode}'
                  ,towSupCode='${this.itemData.towSupCode}'
                  ,brandCode='${this.itemData.brandCode}'
                  ,description='${this.itemData.description}'
                  ,specification='${this.itemData.specification}'
                  ,remark='${this.itemData.remark}'
                  ,print='${res.print + 1}'
                  WHERE id = ${this.itemData.id}`;
                  this.$logger(SQL);
                  this.$db.run(SQL, (err) => {
                    if (err) {
                    } else {
                      // this.$Message.success({
                      //   content: '打印成功',
                      // });
                      this.$parent.getDataList();
                    }
                  });
                }
              });

              this.htmlList.shift();
              setTimeout(() => {
                this.getPrintListHandle('other')
              }, 100);
              // this.printRender('other')
            } else {
              this.$Message.warning('打印已取消,请重新打印');
            }
          }
        );
      }
    });
  },
  methods: {
    print(val) {
      this.htmlList = [];
      this.array = [];
      this.itemData = '';
      this.list = [];
      this.htmlData = '';
      let arr = this.$electronStore.get('setPrintData');
      this.htmlData = Object.assign({}, val[0], arr);
      this.getList();
      this.getPrintListHandle("frist");
    },
    // 获取打印机列表
    getPrintListHandle(val) {
      // 改用ipc异步方式获取列表，解决打印列数量多的时候导致卡死的问题
      ipcRenderer.send('getPrinterList');
      ipcRenderer.once('getPrinterList', (event, data) => {
        // 过滤可用打印机
        this.printList = data.filter((element) => element.status === 0);
        // 1.判断是否有打印服务
        if (this.printList.length <= 0) {
          this.$Message.warning('打印服务异常,请尝试重启电脑');
          this.$emit('cancel');
        } else {
            this.checkPrinter(val);
        }
      });
    },
    // 2.判断打印机状态
    checkPrinter(val) {
      // 本地获取打印机
      const printerName = this.$electronStore.get('printForm') || '';
      const printer = this.printList.find((device) => device.name === printerName);
      // 有打印机设备并且状态正常直接打印
      if (printer && printer.status === 0) {
        this.printDeviceName = printerName;
         this.printRender(val);
      } else if (printerName === '') {
        this.$Message.warning('请先设置其他打印机');
      } else {
        this.$Message.warning('当前打印机不可用,请重新设置');
      }
    },
    printRender(key) {
      // //  this.messageBox = this.$Message.success('打印中，请稍后');
      //   // 获取<webview>节点
      //   const webview = this.$refs.printWebview;
      //   // 发送信息到<webview>里的页
      //   this.itemData = key;
      //   // webview.openDevTools(); //这个方法可以打开print.html的控制台
      //   webview.send('webview-print-render', key); //向webview嵌套的页面响应事件
      if (key == 'first') {
        // this.messageBox = this.$Message.success('打印中，请稍后');
        // 获取<webview>节点
        const webview = this.$refs.printWebview;
        // 发送信息到<webview>里的页
        this.itemData = this.htmlList[0];
        // webview.openDevTools(); //这个方法可以打开print.html的控制台
        webview.send('webview-print-render', this.htmlList[0]); //向webview嵌套的页面响应事件
      } else {
        if (this.htmlList.length >= 1) {
          const webview = this.$refs.printWebview;
          // 发送信息到<webview>里的页
          this.itemData = this.htmlList[0];
          // webview.openDevTools(); //这个方法可以打开print.html的控制台
          webview.send('webview-print-render', this.htmlList[0]); //向webview嵌套的页面响应事件
        } else {
          console.log('失败');
        }
      }
    },
    getList() {
      let printData = this.htmlData.printNum;
      for (let i = 1; i <= printData; i++) {
        let newStr = '';
        let strArr = this.htmlData.serialNumber.split('');
        let zeroStr = '';
        let str = '';
        for (let x = 0; x < strArr.length; x++) {
          if (strArr[x] == '0') {
            zeroStr = strArr[x] + zeroStr;
          } else {
            str = this.htmlData.serialNumber.substring(x, this.htmlData.serialNumber.length);
            break;
          }
        }
        let strNum = str ? parseInt(str) + i : 0 + i;
        newStr = zeroStr + strNum.toString();
        this.array.push(newStr);
        this.list.push(this.htmlData);
      }
      for (let i = 0; i < this.list.length; i++) {
        var obj = {};
        obj.serialNumber = this.array[i];
        (obj.width = this.list[i].width),
          (obj.MfontSize = this.list[i].MfontSize),
          (obj.CfontSize = this.list[i].CfontSize),
          (obj.eWidth = this.list[i].eWidth),
          (obj.eHeight = this.list[i].eHeight),
          (obj.sWidth = this.list[i].sWidth),
          (obj.sHeight = this.list[i].sHeight),
          (obj.lineHeight = this.list[i].lineHeight),
          (obj.materialCode = this.list[i].materialCode),
          (obj.create_time = this.list[i].create_time),
          (obj.lot = this.list[i].lot),
          (obj.plainCode = this.setCode(this.list[i], this.array[i])),
          (obj.printCount = this.list[i].printCount),
          (obj.count = this.list[i].count),
          (obj.supplier = this.list[i].supplier),
          (obj.oneSupCode = this.list[i].oneSupCode),
          (obj.towSupCode = this.list[i].towSupCode),
          (obj.brandCode = this.list[i].brandCode),
          (obj.description = this.list[i].description),
          (obj.specification = this.list[i].specification),
          (obj.print = this.list[i].print),
          (obj.id = this.list[i].id),
          (obj.remark = this.list[i].remark),
          this.htmlList.push(obj);
      }
    },
    setCode(row, val) {
      let plainCode = '';
      if (row.towSupCode === '' && row.brandCode === '') {
        plainCode = row.materialCode + '-' + row.oneSupCode + '-' + row.create_time + '-' + row.lot + '-' + val;
      }
      if (row.towSupCode !== '' && row.brandCode === '') {
        plainCode = row.materialCode + '-' + row.oneSupCode + '-' + row.create_time + '-' + row.lot + '-' + val + '-' + row.towSupCode;
      }
      if (row.towSupCode === '' && row.brandCode !== '') {
        plainCode = row.materialCode + '-' + row.oneSupCode + '-' + row.create_time + '-' + row.lot + '-' + val + '-(' + row.brandCode + ')';
      }
      if (row.towSupCode !== '' && row.brandCode !== '') {
        plainCode = row.materialCode + '-' + row.oneSupCode + '-' + row.create_time + '-' + row.lot + '-' + val + '-' + row.towSupCode + '(' + row.brandCode + ')';
      }
      return plainCode;
    },
  },
};
</script>
<style scoped>
.container {
  position: fixed;
  z-index: -10000;
}
</style>
