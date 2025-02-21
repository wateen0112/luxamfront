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
import setting from '/public/logo/setting.png'
export const menuSections = [
  {
    title: "Control",
    items: [
      { href: "/admin/dashboard", icon: DashboardIcon, label: "Dashboard" },
      {
        icon: OfficeIcon,
        label: "Companies",
        subtitle: [
          {
            label: "Companies",
            href: "/admin/companies",
          },
          {
            label: "Companies Branches",
            href: "/admin/companiesBranches",
          },
        ],
      },
      {
        href: "/admin/requests",
        icon: QuoteRequestIcon,
        label: "Requests",
      },
      {
        href: "/admin/instantCollections",
        icon: InstantCollectionsIcon,
        label: "Instant Collections",
      },
      {
        href: "/admin/paymentTypes",
        icon: PaymentTypesIcon,
        label: "Payment Types",
      },
      { href: "/admin/statements", icon: StatementsIcon, label: "Statements" },
      {
        href: "/admin/collectionScheduling",
        icon: CollectionSchedulingIcon,
        label: "Collection Scheduling",
        subtitle: [
          {
            label: "Schedules",
            href: "/admin/collectionScheduling",
          },
          {
            label: "Oil Collection Scheduling",
            href: "/admin/oilCollectionScheduling",
          },
          {
            label: "General Search",
            href: "/admin/general-search",
          },
        ],
      },
    ],
  },

  {
    title: "User & Driver",
    items: [
      { href: "/admin/users", icon: UserIcon, label: "Users" },
      {
        icon: VehicleIcon,
        label: "Vehicle Driver",
        subtitle: [
          {
            label: "Drivers",
            href: "/admin/drivers",
          },
          {
            label: "Vehicles",
            href: "/admin/vehicles",
          },
          {
            label: "Vehicle Drivers",
            href: "/admin/vehicleDrivers",
          },
        ],
      },
    ],
  },
  {
    title: "Cities & Areas",
    items: [
      { href: "/admin/cities", icon: cities, label: "Cities" },
      { href: "/admin/areas", icon: areas, label: "Areas" },
    ],
  },
  {
    title: "Roles & Permission",
    items: [{ href: "/admin/admin", icon: roles, label: "Admins" }],
  },
  {
    title: "General",
    items: [{ href: "/admin/map", icon: map, label: "Map" },{ href: "/admin/logs", icon: setting, label: "Logs" }],
 
  },
];
