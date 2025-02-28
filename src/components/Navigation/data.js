import DashboardIcon from "/public/logo/dashboard.png";
import OfficeIcon from "/public/logo/office.png";
import QuoteRequestIcon from "/public/logo/quote-request.png";
import InstantCollectionsIcon from "/public/logo/instantCollections.svg";
import CollectionSchedulingIcon from "/public/logo/collectionScheduling.svg";
import PaymentTypesIcon from "/public/logo/paymentTypes.svg";
import StatementsIcon from "/public/logo/statments.svg";
import UserIcon from "/public/logo/user.png";
import VehicleIcon from "/public/logo/vehicle.svg";
import cities from "/public/logo/cities.svg";
import areas from "/public/logo/areas.svg";
import roles from "/public/logo/roles.svg";
import map from "/public/logo/map.png";
import settings from '/public/logo/settings.svg';
import logs from '/public/logo/logs.svg';
import gps from '/public/logo/gps.svg';
import Cookies from "js-cookie";

// Get permissions from cookies and split them into an array
const permissions = Cookies.get("userPermissions") ? Cookies.get("userPermissions").split(",") : [];


// Function to check if a permission exists in the permissions array
const hasPermission = (requiredPermission) => permissions.includes(requiredPermission);

// Define menu sections with permission requirements
const menuSections = [
  {
    title: "Control",
    items: [
      { href: "/admin/dashboard", icon: DashboardIcon, label: "Dashboard", permission: "dashboard_access" },
      {
        icon: OfficeIcon,
        label: "Companies",
        subtitle: [
          { label: "Companies", href: "/admin/companies", permission: "view_companies" },
          { label: "Companies Branches", href: "/admin/companiesBranches", permission: "view_company_branches" },
        ],
        permission: ["view_companies", "view_company_branches"]
      },
      { href: "/admin/requests", icon: QuoteRequestIcon, label: "Requests", permission: "view_requests" },
      { href: "/admin/instantCollections", icon: InstantCollectionsIcon, label: "Instant Collections", permission: "view_instant_collections" },
      {
        href: "/admin/collectionScheduling",
        icon: CollectionSchedulingIcon,
        label: "Collection Scheduling",
        subtitle: [
          { label: "Schedules", href: "/admin/collectionScheduling", permission: "view_schedules" },
          { label: "Oil Collection Scheduling", href: "/admin/oilCollectionScheduling", permission: "view_oil_collections" },
          { label: "General Search", href: "/admin/general-search", permission: "search_requests" },
        ],
        permission: ["view_schedules", "view_oil_collections", "search_requests"]
      },
      { href: "/admin/paymentTypes", icon: PaymentTypesIcon, label: "Payment Types", permission: "view_payment_types" },
      { href: "/admin/statements", icon: StatementsIcon, label: "Statements", permission: "view_statements" },
    ],
  },
  {
    title: "User & Driver",
    items: [
      { href: "/admin/users", icon: UserIcon, label: "Users" }, // No permission, always shown
      {
        icon: VehicleIcon,
        label: "Vehicle Driver",
        subtitle: [
          { label: "Drivers", href: "/admin/drivers" }, // No permission, always shown
          { label: "Vehicles", href: "/admin/vehicles" }, // No permission, always shown
          { label: "Vehicle Drivers", href: "/admin/vehicleDrivers" }, // No permission, always shown
        ],
      },
    ],
  },
  {
    title: "Cities & Areas",
    items: [
      { href: "/admin/cities", icon: cities, label: "Cities" }, // No permission, always shown
      { href: "/admin/areas", icon: areas, label: "Areas" }, // No permission, always shown
    ],
  },
  {
    title: "Roles & Permission",
    items: [
      { href: "/admin/admin", icon: roles, label: "Admins" }, // No permission, always shown
    ],
  },
  {
    title: "Reports",
    items: [
      { href: "/admin/logs", icon: logs, label: "Logs" }, // No permission, always shown
      { href: "/admin/settings", icon: settings, label: "Settings", permission: "view_settings" },
    ],
  },
  {
    title: "General",
    items: [
      { href: "/admin/map", icon: map, label: "Map" }, // No permission, always shown
      { href: "/admin/gps", icon: gps, label: "GPS" }, // No permission, always shown
    ],
  },
];

// Filter menu sections based on permissions
export const filteredMenuSections = menuSections
  .map(section => ({
    ...section,
    items: section.items
      .map(item => {
        // Handle items with subtitles
        if (item.subtitle) {
          const filteredSubtitle = item.subtitle
            .filter(subItem => 
              !subItem.permission || hasPermission(subItem.permission) // Show if no permission or permission exists
            );
          // Show parent item if it has no permission or meets permission criteria
          const showParent = !item.permission || 
            (Array.isArray(item.permission) 
              ? item.permission.some(p => hasPermission(p)) 
              : hasPermission(item.permission));
          // Include item if it or its subtitles are visible
          return (filteredSubtitle.length > 0 || showParent)
            ? { ...item, subtitle: filteredSubtitle.length > 0 ? filteredSubtitle : item.subtitle }
            : null;
        }
        // Handle items without subtitles
        return !item.permission || hasPermission(item.permission) ? item : null;
      })
      .filter(Boolean), // Remove null items
  }))
  .filter(section => section.items.length > 0); // Remove empty sections