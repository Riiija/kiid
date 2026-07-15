import { Navigate, createBrowserRouter } from 'react-router-dom'
import { ChildLayout } from '../components/layout/ChildLayout'
import { ParentLayout } from '../components/layout/ParentLayout'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { ChildDetailsPage } from '../features/children/pages/ChildDetailsPage'
import { ChildDashboardPage } from '../features/dashboard/pages/ChildDashboardPage'
import { ParentDashboardPage } from '../features/dashboard/pages/ParentDashboardPage'
import { MyQrCodePage } from '../features/qr-code/pages/MyQrCodePage'
import { QrScannerPage } from '../features/qr-code/pages/QrScannerPage'
import { MyRewardsPage } from '../features/rewards/pages/MyRewardsPage'
import { RewardsManagementPage } from '../features/rewards/pages/RewardsManagementPage'
import { ChildSettingsPage } from '../features/settings/pages/ChildSettingsPage'
import { FamilySettingsPage } from '../features/settings/pages/FamilySettingsPage'
import { MySavingsGoalsPage } from '../features/savings-goals/pages/MySavingsGoalsPage'
import { SavingsGoalsManagementPage } from '../features/savings-goals/pages/SavingsGoalsManagementPage'
import { MyTransactionsPage } from '../features/transactions/pages/MyTransactionsPage'
import { TransactionsPage } from '../features/transactions/pages/TransactionsPage'

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute publicOnly />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={['parent']} />,
        children: [
          {
            path: '/parent',
            element: <ParentLayout />,
            children: [
              {
                index: true,
                element: <Navigate to="/parent/dashboard" replace />,
              },
              {
                path: 'dashboard',
                element: <ParentDashboardPage />,
              },
              {
                path: 'children/:childId',
                element: <ChildDetailsPage />,
              },
              {
                path: 'transactions',
                element: <TransactionsPage />,
              },
              {
                path: 'scan',
                element: <QrScannerPage />,
              },
              {
                path: 'rewards',
                element: <RewardsManagementPage />,
              },
              {
                path: 'savings',
                element: <SavingsGoalsManagementPage />,
              },
              {
                path: 'settings',
                element: <FamilySettingsPage />,
              },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['child']} />,
        children: [
          {
            path: '/child',
            element: <ChildLayout />,
            children: [
              {
                index: true,
                element: <Navigate to="/child/dashboard" replace />,
              },
              {
                path: 'dashboard',
                element: <ChildDashboardPage />,
              },
              {
                path: 'transactions',
                element: <MyTransactionsPage />,
              },
              {
                path: 'qr-code',
                element: <MyQrCodePage />,
              },
              {
                path: 'rewards',
                element: <MyRewardsPage />,
              },
              {
                path: 'savings',
                element: <MySavingsGoalsPage />,
              },
              {
                path: 'settings',
                element: <ChildSettingsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])
