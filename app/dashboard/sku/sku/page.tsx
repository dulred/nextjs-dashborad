'use client'
import { goods_add, goods_all, goods_byId, goods_delete, goods_update, tmp_goods_upload } from "@/app/service/model-management/product";
import { useEffect, useState } from "react";
import React from 'react';
import { Button, Card, Flex, Form, Input, InputNumber, List, message, Modal, Popconfirm, Select, Space, Switch, Table, Tag, Typography, Upload } from 'antd';
import type { GetProp, PopconfirmProps, TableColumnsType, TableProps, UploadProps } from 'antd';
import { createStyles } from 'antd-style';
import Image from "next/image";
import { category_add, category_byId, category_delete, category_first, category_second, category_update } from "@/app/service/model-management/category";
import { goods_spec_add_random, goods_spec_bycategoryId, goods_spec_delete, goods_spec_update } from "@/app/service/sku/spec";
import { LoadingOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { goods_sku_bycategoryId, goods_sku_update, tmp_goods_sku_upload } from "@/app/service/sku/sku";


type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};


const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 4 },
  },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};



const App: React.FC = () => {

  const  [t_date,setTdata] =useState([])
  const [category,setCategory] = useState([])
  const [skuData,setSkuData] = useState({})
  const [specId,setSpecId] = useState("")
  const [imageUrl, setImageUrl] = useState<string>();
  const [imageHttpsUrl, setImageHttpsUrl] = useState<string>();
  const [loading, setLoading] = useState(false);
  const fetchData = async ()=>{
    const res = await category_second()
    setCategory(res.data.result)
  }
  useEffect(()=>{
    fetchData()
  },[])
  

  const [form] = Form.useForm();

const showModal = (record:any) => {
  setSpecId(record.id)
  form.setFieldsValue({
    price: record.price,
    inventory: record.inventory,
    picture: record.picture,
  })
  setImageHttpsUrl(record.picture)
  setImageUrl(record.picture)
  setIsModalOpen(true);
};
const onFinish = async (values: any) => {
  console.log(imageHttpsUrl)
  const sData = {
    id: specId,
    inventory: values.inventory,
    price: values.price,
    picture: imageHttpsUrl,
  }
  await goods_sku_update(sData)
  const res = await goods_sku_bycategoryId(skuData)
  setTdata(res.data.result)
  setIsModalOpen(false);
 };

 const onReset = () => {
   form.resetFields();
 };


  const onChange = async (id: string) => {
    const specData = {
      categoryId: id,
      page: 1,
      pageSize: 10
    }
    setSkuData(specData)
    const res = await goods_sku_bycategoryId(specData)
    setTdata(res.data.result)
  };
  
  const columns: TableProps['columns'] = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      width:100
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width:100
    },
    {
      title: '图片',
      dataIndex: 'pictureUrl',
      key: 'pictureUrl',
      render: (item: any) => (
        <Image src={item} alt="s" width={152} height={152} />
      ),
    },
    {
      title: '商品描述',
      dataIndex: 'description',
      key: 'description',
      width:150
    },
    {
      title: '是否下架',
      dataIndex: 'isDiscontinued',
      key: 'isDiscontinued',
      render: (item: any) => (
        <Tag color={item === 'true'?'error' : 'success'}>{item === 'true'? '是' : '否'}</Tag>
      ),
    },
    // {
    //   title: '操作',
    //   key: 'action',
    //   render: (_,record) => (
    //     <>
    //     <Space size="middle">
    //       <Button type="primary">更新配置</Button>
    //     </Space>

    //     </>
        
    //   ),
    // },
  ];
  
  const data = t_date.map((item:any,index)=>{
    return {
      key: `${index}`,
      id: item.id,
      name: item.name,
      pictureUrl: item.pictureUrl,
      description: item.description,
      isDiscontinued: item.isDiscontinued === 'true'? '是' : '否',
      skus:item.skus
    }
  })

const [isModalOpen, setIsModalOpen] = useState(false);



const handleOk = () => {
  setIsModalOpen(false);
};

const handleCancel = () => {
  setIsModalOpen(false);
};

const columns2 = [
  { title: 'id', dataIndex: 'id', key: 'id' },
  { title: '规格', dataIndex: 'specs', key: 'specs',
    render: (o_data: any) => {  
      const array = JSON.parse(o_data);
      return(
      <List
      grid={{ gutter: 16, column: 4 }}
      dataSource={array}
      renderItem={(item:any) => (
        <List.Item>
          <Card title={item.name}>{item.valueName}</Card>
        </List.Item>
      )}
    />
    )},
  },
  { title: '图片', dataIndex: 'picture', key: 'picture',
    render: (item: any) => (
      <Image src={item} alt="s" width={152} height={152} />
    ),
  },
  { title: '价格', dataIndex: 'price', key: 'price'},
  { title: '库存', dataIndex: 'inventory', key: 'inventory'},
  {
    title: '操作',
    dataIndex: 'operation',
    render: (_: any, record: any) => {
      return (
        <Space>
          <Typography.Link  onClick={() => showModal(record)}>
            编辑
          </Typography.Link>
        </Space>

      );
    },
  },
];


  // Initialize the form with one input
  const initialValues = {
    values: [''], // 这里添加一个初始值
  };

  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as FileType, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );


  return (
    <main>
      <h3 className="text-lg font-bold mb-5">商品spec规格</h3>

        <Space style={{margin:"30px 0px"}}>
            <h3 className="">分类选择</h3>
            <Select
          placeholder="请选择商品所属分类"
          optionFilterProp="label"
          onChange={onChange}
          options={category.map((item:any,index)=>{
            return {value:item.id, label:item.categoryName}  // 注意key和value的对应
          })}
        />
      </Space>

        <Table columns={columns} dataSource={data} 
             expandable={{
              expandedRowRender: (record) => {
                return ( 
                  <Table
                    bordered
                    columns={columns2}
                    pagination={false}
                    dataSource={record.skus}
                    rowClassName="editable-row"
                    rowKey={(item:any) => item.id} // 为每一行定义唯一的 key
                  />
              )},
            }}
          />

      <Modal title="sku设置" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}
        footer={
          <Button type="primary" onClick={handleCancel}>
            取消
          </Button>
        }
      >
      <Form
      initialValues={initialValues}
      {...formItemLayout}
      form={form}
      name="control-hooks"
      onFinish={onFinish}
      style={{ maxWidth: 400 ,marginTop: '30px'}}
    >
    
      <Form.Item name="price" label="价格" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="inventory" label="库存" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="picture" label="图片" rules={[{ required: true }]}>
      <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          customRequest={async ({ file, onSuccess, onError }) => {
            const formData = new FormData();
            formData.append('file', file);
            try {
              const response = await tmp_goods_sku_upload(formData)
              setImageHttpsUrl(response.data.result.http_url)
              onSuccess(response.data);
            } catch (error) {
              onError(error);
            }
          }}
          beforeUpload={beforeUpload}
          onChange={handleChange}
        >
          {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
        </Upload>
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Space>
          <Button type="primary" htmlType="submit">
            提交表单
          </Button>
          <Button htmlType="button" onClick={onReset}>
            重置表单
          </Button>
        </Space>
      </Form.Item>
    </Form>
      </Modal>
    </main>
  
  );
};

export default App;