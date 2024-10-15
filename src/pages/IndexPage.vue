<template>
  <q-page class="row q-pt-xl">
    <div class="full-width q-px-xl">
      <div class="q-mb-xl">
        <q-input v-model="tempData.name" :rules="[ val => !!val || '姓名必填']" label="姓名" />
        <q-input v-model="tempData.age" :rules="[val => /^\d+$/.test(val) || '年齡必須是數字']"  label="年齡" />
        <q-btn color="primary" class="q-mt-md" @click="addUser">新增</q-btn>
      </div>

      <q-table
        flat
        bordered
        ref="tableRef"
        :rows="blockData"
        :columns="(tableConfig as QTableProps['columns'])"
        row-key="id"
        hide-pagination
        separator="cell"
        :rows-per-page-options="[0]"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
            <q-th></q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="min-width: 120px"
            >
              <div>{{ col.value }}</div>
            </q-td>
            <q-td class="text-right" auto-width v-if="tableButtons.length > 0">
              <q-btn
                @click="handleClickOption(btn, props.row)"
                v-for="(btn, index) in tableButtons"
                :key="index"
                size="sm"
                color="grey-6"
                round
                dense
                :icon="btn.icon"
                class="q-ml-md"
                padding="5px 5px"
              >
                <q-tooltip
                  transition-show="scale"
                  transition-hide="scale"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                >
                  {{ btn.label }}
                </q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data="{ icon }">
          <div
            class="full-width row flex-center items-center text-primary q-gutter-sm"
            style="font-size: 18px"
          >
            <q-icon size="2em" :name="icon" />
            <span> 無相關資料 </span>
          </div>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import axios from 'axios';
import { useQuasar } from 'quasar'
// import request from '../lib/request'
import { QTableProps } from 'quasar';
import { ref } from 'vue';

const $q = useQuasar()
const alert = (userData: UserData) => {
  $q.dialog({
    title: 'Alert',
    message: '請輸入欲修改姓名',
    prompt: {
            model: '',
            isValid: val => val.length > 0, // << here is the magic
            type: 'text' // optional
          },
          cancel: true,
          persistent: true
  }).onOk(async (data) => {
    const res = await axios.patch('https://dahua.metcfire.com.tw/api/CRUDTest', {
      name: data,
      age: userData.age,
      id: userData.id
    })
    if(res.data) {
      init()
    }
  })
}

const deleteModal = async (id: string) => {
  $q.dialog({
    title: '刪除',
    message: '確認刪除嗎'
  }).onOk(async () => {
    const res = await axios.delete(`https://dahua.metcfire.com.tw/api/CRUDTest/${id}`)
    if(res.data) {
      init()
    }
  })
}

interface btnType {
  label: string;
  icon: string;
  status: string;
}
interface UserData {
  id: string;
  name: string;
  age: number;
}
const blockData = ref([]);
const tableConfig = ref([
  {
    label: '姓名',
    name: 'name',
    field: 'name',
    align: 'left',
  },
  {
    label: '年齡',
    name: 'age',
    field: 'age',
    align: 'left',
  },
]);
const tableButtons = ref([
  {
    label: '編輯',
    icon: 'edit',
    status: 'edit',
  },
  {
    label: '刪除',
    icon: 'delete',
    status: 'delete',
  },
]);


const tempData = ref({
  name: '',
  age: '',
});
async function init() {
  const res = await axios.get('https://dahua.metcfire.com.tw/api/CRUDTest/a')
  console.log(res)
  blockData.value = res.data
}
init()
function handleClickOption(btn: btnType, data: UserData) {
  if(btn.status === 'edit') {
    alert(data)
  }
  else {
    deleteModal(data.id)
  }
}
async function addUser() {
  if(!tempData.value.name || !tempData.value.age) {
    $q.dialog({
      title: '錯誤',
      message: '請填寫所有欄位',
    });
    return;
  }
  try {
    const response = await axios.post('https://dahua.metcfire.com.tw/api/CRUDTest', {
      name: tempData.value.name,
      age: tempData.value.age
    });

    if(response.data) {
      $q.dialog({
        title: '成功',
        message: '新增成功',
      });
      tempData.value.age = ''
      tempData.value.name = ''
      init()
    }
  } catch (error) {
    console.error('Error during API request:', error);
    $q.dialog({
      title: '錯誤',
      message: '請求失敗，請稍後再試',
    });
  }
}

</script>

<style lang="scss" scoped>
.q-table th {
  font-size: 20px;
  font-weight: bold;
}

.q-table tbody td {
  font-size: 18px;
}
</style>
