import React from 'react';
import { Card, CardBody, CardHeader, Tabs, Tab, Chip, Button, Select, SelectItem, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from '@heroui/react';
import { Icon } from '@iconify/react';
import { PageHeader } from '../components/page-header';
import { DataTable } from '../components/data-table';
import { accountingData } from '../data/mock-data';

export const Accounting: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTab, setSelectedTab] = React.useState('income');
  const [reportPeriod, setReportPeriod] = React.useState('month');
  const [incomeList, setIncomeList] = React.useState([...accountingData.income]);
  const [expensesList, setExpensesList] = React.useState([...accountingData.expenses]);
  const [transactionType, setTransactionType] = React.useState<'income' | 'expense'>('income');
  const [formData, setFormData] = React.useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddTransaction = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setFormData({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    onOpen();
  };

  const handleSaveTransaction = () => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor ingrese un monto válido');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      date: formData.date,
      description: formData.description,
      amount,
      category: formData.category || 'Otros'
    };

    if (transactionType === 'income') {
      setIncomeList(prev => [newTransaction, ...prev]);
    } else {
      setExpensesList(prev => [newTransaction, ...prev]);
    }
    onClose();
  };

  const incomeColumns = [
    {
      key: 'date',
      label: 'Fecha',
      renderCell: (item: any) => {
        const date = new Date(item.date);
        return date.toLocaleDateString('es-MX');
      }
    },
    {
      key: 'description',
      label: 'Descripción'
    },
    {
      key: 'category',
      label: 'Categoría',
      renderCell: (item: any) => (
        <Chip color="primary" variant="flat" size="sm">
          {item.category}
        </Chip>
      )
    },
    {
      key: 'amount',
      label: 'Monto',
      renderCell: (item: any) => (
        <span className="font-medium text-success">${item.amount.toFixed(2)}</span>
      )
    }
  ];

  const expensesColumns = [
    {
      key: 'date',
      label: 'Fecha',
      renderCell: (item: any) => {
        const date = new Date(item.date);
        return date.toLocaleDateString('es-MX');
      }
    },
    {
      key: 'description',
      label: 'Descripción'
    },
    {
      key: 'category',
      label: 'Categoría',
      renderCell: (item: any) => (
        <Chip color="secondary" variant="flat" size="sm">
          {item.category}
        </Chip>
      )
    },
    {
      key: 'amount',
      label: 'Monto',
      renderCell: (item: any) => (
        <span className="font-medium text-danger">${item.amount.toFixed(2)}</span>
      )
    }
  ];

  const totalIncome = incomeList.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expensesList.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Contabilidad" 
        description="Gestión financiera"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-divider">
          <CardBody>
            <div className="flex flex-col">
              <p className="text-sm text-foreground-500">Ingresos</p>
              <p className="text-2xl font-semibold text-success">${totalIncome.toFixed(2)}</p>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-divider">
          <CardBody>
            <div className="flex flex-col">
              <p className="text-sm text-foreground-500">Gastos</p>
              <p className="text-2xl font-semibold text-danger">${totalExpenses.toFixed(2)}</p>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-divider">
          <CardBody>
            <div className="flex flex-col">
              <p className="text-sm text-foreground-500">Balance</p>
              <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
                ${balance.toFixed(2)}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs 
          aria-label="Opciones de contabilidad" 
          selectedKey={selectedTab}
          onSelectionChange={setSelectedTab as any}
        >
          <Tab key="income" title="Ingresos" />
          <Tab key="expenses" title="Gastos" />
        </Tabs>
        
        <div className="flex gap-2">
          <Select
            label="Periodo"
            selectedKeys={[reportPeriod]}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="w-40"
          >
            <SelectItem key="day" value="day">Hoy</SelectItem>
            <SelectItem key="week" value="week">Esta semana</SelectItem>
            <SelectItem key="month" value="month">Este mes</SelectItem>
            <SelectItem key="year" value="year">Este año</SelectItem>
          </Select>
          
          <Button 
            color="primary" 
            startContent={<Icon icon="lucide:plus" />}
            onPress={() => handleAddTransaction(selectedTab as 'income' | 'expense')}
          >
            {selectedTab === 'income' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
          </Button>
        </div>
      </div>
      
      {selectedTab === 'income' && (
        <Card className="border border-divider">
          <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h4 className="font-semibold text-large">Registro de Ingresos</h4>
          </CardHeader>
          <CardBody>
            <DataTable 
              data={incomeList}
              columns={incomeColumns}
              searchable
              searchPlaceholder="Buscar ingresos..."
            />
          </CardBody>
        </Card>
      )}
      
      {selectedTab === 'expenses' && (
        <Card className="border border-divider">
          <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h4 className="font-semibold text-large">Registro de Gastos</h4>
          </CardHeader>
          <CardBody>
            <DataTable 
              data={expensesList}
              columns={expensesColumns}
              searchable
              searchPlaceholder="Buscar gastos..."
            />
          </CardBody>
        </Card>
      )}
      
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {transactionType === 'income' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Descripción"
                    placeholder="Descripción de la transacción"
                    value={formData.description}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    isRequired
                  />
                  <Input
                    type="number"
                    label="Monto"
                    placeholder="0.00"
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">$</span>
                      </div>
                    }
                    value={formData.amount}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
                    isRequired
                  />
                  <Input
                    label="Categoría"
                    placeholder="Categoría"
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  />
                  <Input
                    type="date"
                    label="Fecha"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancelar
                </Button>
                <Button 
                  color={transactionType === 'income' ? 'success' : 'danger'} 
                  onPress={handleSaveTransaction}
                >
                  Guardar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};