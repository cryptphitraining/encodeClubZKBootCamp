import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import React from "react";
import { Card, CardHeader, Spacer, Input, Button } from "@nextui-org/react";
import dynamic from "next/dynamic";

// Cargar Countdown dinámicamente para evitar errores de hidratación
const Countdown = dynamic(() => import("../../components/Countdown"), { ssr: false });

const getNextMonday = (): string => {
  const today = new Date();
  const nextMonday = new Date(
    today.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7))
  );
  nextMonday.setHours(23, 59, 59, 999); // Establecer la hora al final del día
  return nextMonday.toISOString();
};


export default function AdminPage() {
  const targetDate = getNextMonday();
  return (
    <DefaultLayout>
      <h1 className={`${title()} text-green-500 pb-2`}>
        Admin dashboard
      </h1>
      <Spacer y={12} />
      <div className="w-full gap-2 grid grid-cols-12  px-8">
        <Card isBlurred className="w-full h-[200px] col-span-12 sm:col-span-6 relative flex justify-center items-center">
          <CardHeader className="absolute z-10 top-1 flex-col items-start">
            <h4 className="text-white/90 font-medium text-3xl">Game Week</h4>
          </CardHeader>
          <div className="text-green-500 text-6xl font-bold">
            5 {/* Aquí puedes sustituir 1234 por el ID real */}
          </div>
        </Card>
        <Card isBlurred className="w-full h-[200px] col-span-12 sm:col-span-6 relative flex justify-center items-center">
          <CardHeader className="absolute z-10 top-1 flex-col items-start">
            <h4 className="text-white/90 font-medium text-3xl">Countdown</h4>
          </CardHeader>
          <div className="text-green-500 text-2xl font-bold">
            <Countdown targetDate={targetDate} />
          </div>
        </Card>
        <Card isBlurred className="w-full h-[200px] col-span-12 sm:col-span-12 relative flex justify-center items-center">
          <CardHeader className="absolute z-10 top-1 flex-col items-start">
            <h4 className="text-white/90 font-medium text-3xl">Winnig Numbers</h4>

          </CardHeader>
          <div className="w-full gap-2 grid grid-cols-6  px-8">
            <Input
              type="number"
              label=""
              placeholder="0"
            />
            <Input
              type="number"
              label=""
              placeholder="0"
              startContent={
                <div className="pointer-events-none flex items-center">
                </div>
              }
            />
            <Input
              type="number"
              label=""
              placeholder="0"
              startContent={
                <div className="pointer-events-none flex items-center">
                </div>
              }
            />
            <Input
              type="number"
              label=""
              placeholder="0"
              startContent={
                <div className="pointer-events-none flex items-center">
                </div>
              }
            />
            <Input
              type="number"
              label=""
              placeholder="0"
              startContent={
                <div className="pointer-events-none flex items-center">
                </div>
              }
            />
            <Input
              type="number"
              label=""
              placeholder="0"
              startContent={
                <div className="pointer-events-none flex items-center">
                </div>
              }
            />
          </div>
        </Card>
      </div>
      <div className="flex justify-center mt-6">
      <Button radius="full" color="success" className="text-black shadow-xl w-48 h-12">
              Start Game Week
            </Button>
            <Button radius="full" color="success" className="text-black shadow-xl w-48 h-12 ml-4">
            End Game Week
            </Button>
          </div>
    </DefaultLayout>
  );
}
