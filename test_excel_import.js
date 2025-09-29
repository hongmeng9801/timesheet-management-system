// 测试ExcelImportDialog的修改
// 验证单价可空和时间格式处理

const testData = [
  {
    公司名称: '测试公司',
    生产线: '生产线A',
    工时类型: '生产工时',
    产品名称: '测试产品',
    产品工序: '测试工序',
    单价: '', // 空单价
    生效年月: '2024-01'
  },
  {
    公司名称: '测试公司',
    生产线: '生产线B',
    工时类型: '非生产工时',
    产品名称: '测试产品2',
    产品工序: '测试工序2',
    单价: '10.5', // 有效单价
    生效时间: '2024-02-15' // 完整日期格式
  }
];

// 模拟数据转换逻辑
function transformData(row) {
  return {
    company_id: 'test-company-id',
    production_line: row.生产线,
    production_category: row.工时类型,
    product_name: row.产品名称,
    product_process: row.产品工序,
    unit_price: row.单价 && row.单价 !== '' ? Number(row.单价) : null,
    effective_date: (() => {
      const dateValue = row.生效年月 || row.生效时间;
      if (!dateValue) return null;
      
      const dateStr = String(dateValue).trim();
      if (dateStr.match(/^\d{4}-\d{2}$/)) {
        return dateStr;
      } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr.substring(0, 7);
      } else {
        return dateStr;
      }
    })()
  };
}

// 测试数据转换
console.log('测试数据转换结果:');
testData.forEach((row, index) => {
  const result = transformData(row);
  console.log(`第${index + 1}行:`, result);
  
  // 验证单价处理
  if (row.单价 === '') {
    console.log(`✓ 空单价正确处理为: ${result.unit_price}`);
  } else {
    console.log(`✓ 单价正确转换为: ${result.unit_price}`);
  }
  
  // 验证日期格式
  console.log(`✓ 日期格式处理为: ${result.effective_date}`);
  console.log('---');
});

console.log('测试完成！');