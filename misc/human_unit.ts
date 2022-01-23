export default function HumanUnit(size: number): string
{
    let units = ['bytes', 'KiB', 'MiB', 'GiB'];

    let u = 0;
    let n = size;

    while(n > 1024 && u < units.length)
    {
        if(n > 1024)
        {
            n = n / 1024;
            u++;
        }
    }

    return `${n.toFixed(2)}${units[u]}`;
}